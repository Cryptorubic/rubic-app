import { inject, Injectable } from '@angular/core';
import { StoreService } from '@core/services/store/store.service';
import { Store } from '@core/services/store/models/store';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  from,
  map,
  Observable,
  of,
  shareReplay
} from 'rxjs';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { switchTap } from '@shared/utils/utils';
import {
  MerkletreeScanUpdateEvent,
  NetworkName,
  RailgunBalancesEvent,
  RailgunERC20AmountRecipient,
  RailgunWalletBalanceBucket,
  RailgunWalletInfo,
  TransactionGasDetails,
  TXIDVersion
} from '@railgun-community/shared-models';
import { BLOCKCHAIN_NAME, blockchainId, BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import BigNumber from 'bignumber.js';
import { HDNodeWallet, Wallet, ContractTransaction } from 'ethers';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  getShieldSignature
} from '@features/privacy/providers/railgun/utils/tx-utils';
import {
  fromPrivateToRubicChainMap,
  fromRubicToPrivateChainMap,
  RailgunSupportedChain
} from '@features/privacy/providers/railgun/constants/network-map';
import {
  CreatePrivateWalletRequest,
  CreatePrivateWalletResponse,
  GasEstimateForShieldNativeRequest,
  GasEstimateForShieldRequest,
  GasEstimateForTransferRequest,
  GasEstimateForUnshieldRequest,
  GasEstimateResponse,
  GenerateTransferProofRequest,
  GenerateUnshieldProofRequest,
  GetEvmWalletResponse,
  GetMnemonicResponse,
  LoadWalletRequest,
  LoadWalletResponse,
  PopulateResponse,
  PopulateShieldNativeRequest,
  PopulateShieldRequest,
  PopulateTransferRequest,
  PopulateUnshieldRequest,
  SetupFromPasswordRequest,
  SetupFromPasswordResponse,
  UnlockFromPasswordRequest,
  UnlockFromPasswordResponse,
  WalletCredentialsRequest
} from '@features/privacy/providers/railgun/models/worker-types';
import { ShieldedBalanceToken } from '@features/privacy/providers/shared-privacy-providers/components/shielded-tokens-list/models/shielded-balance-token';

@Injectable()
export class RailgunFacadeService {
  private readonly _shieldedTokens$ = new BehaviorSubject<ShieldedBalanceToken[]>([]);

  public readonly shieldedTokens$ = this._shieldedTokens$.asObservable();

  private syncResolvers = new Map<number, () => void>();

  private railgunWorker = new Worker(new URL('./worker/railgun.worker', import.meta.url), {
    type: 'module'
  });

  private messageIdCounter = 0;

  private pendingRequests = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
  >();

  private readonly _selectedBlockchain$ = new BehaviorSubject(BLOCKCHAIN_NAME.POLYGON);

  public readonly selectedBlockchain$ = this._selectedBlockchain$.asObservable();

  private readonly _railgunInitialised$ = new BehaviorSubject<boolean>(false);

  public readonly railgunInitialised$ = this._railgunInitialised$.asObservable();

  private readonly storeService = inject(StoreService);

  private readonly storageKey: keyof Store = 'RAILGUN_ENCRYPTION_CREDS_V1';

  private readonly _balancesByBucket$ = new BehaviorSubject<
    Record<RailgunSupportedChain, Partial<Record<RailgunWalletBalanceBucket, RailgunBalancesEvent>>>
  >({
    [BLOCKCHAIN_NAME.POLYGON]: {},
    [BLOCKCHAIN_NAME.ARBITRUM]: {},
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {},
    [BLOCKCHAIN_NAME.ETHEREUM]: {}
  });

  public readonly balancesSnapshot$ = this._balancesByBucket$.asObservable();

  private readonly _account$ = new BehaviorSubject<PublicAccount | null>(null);

  public readonly account$ = this._account$.asObservable().pipe(
    switchTap(account => {
      if (account) {
        return from(this.handleAccount(account));
      }
      return of(null);
    })
  );

  private readonly _railgunAccount$ = new BehaviorSubject<
    (RailgunWalletInfo & { evmWalletAddress: string }) | null
  >(null);

  public readonly railgunAccount$ = this._railgunAccount$.asObservable();

  private readonly _utxoScan$ = new BehaviorSubject<Record<RailgunSupportedChain, number>>({
    [BLOCKCHAIN_NAME.ETHEREUM]: 0,
    [BLOCKCHAIN_NAME.ARBITRUM]: 0,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 0,
    [BLOCKCHAIN_NAME.POLYGON]: 0
  });

  public readonly utxoScan$ = this._utxoScan$.asObservable().pipe(debounceTime(5));

  public readonly completedChains$ = this.utxoScan$.pipe(
    map(scan => {
      return Object.entries(scan)
        .filter(([_, progress]) => progress === 100)
        .map(([chain]) => chain as RailgunSupportedChain);
    }),
    distinctUntilChanged()
  );

  public lastUsedPassword = '';

  public readonly balances$: Observable<
    Record<
      RailgunSupportedChain,
      | {
          address: string;
          amount: string;
          blockchain: BlockchainName;
        }[]
      | null
    >
  > = this.balancesSnapshot$.pipe(
    map(event => {
      const result: Record<
        string,
        { blockchain: BlockchainName; address: string; amount: string }[]
      > = {};
      Object.entries(event).forEach(([chain, update]) => {
        result[chain] =
          update?.Spendable?.erc20Amounts
            .filter(el => el.amount !== 0n)
            .map(token => ({
              blockchain: BlockchainsInfo.getBlockchainNameById(update.Spendable.chain.id),
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            })) || null;
      });
      return result;
    }),
    shareReplay(1)
  );

  public readonly pendingBalances$ = this.balancesSnapshot$.pipe(
    map(event => {
      return Object.values(event).flatMap(update => {
        const tokens =
          update?.ShieldPending?.erc20Amounts
            // .filter(token => token.amount > 0n)
            .map(token => ({
              blockchain: BlockchainsInfo.getBlockchainNameById(update.ShieldPending.chain.id),
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            })) || [];
        return tokens;
      });
    }),
    shareReplay(1)
  );

  constructor() {
    const shieldedTokens = this.storeService.getItem('RAILGUN_SHIELDED_TOKENS');
    this._shieldedTokens$.next(shieldedTokens || []);
  }

  public initWorker(): void {
    this.railgunWorker.onmessage = ({ data }) => {
      if (data.method === 'balanceUpdate') {
        this.handleBalanceUpdate(data.response);
        return;
      }
      if (data.method === 'utxoScanUpdate') {
        this.handleUtxoScanUpdate(data.response);
        return;
      }

      if (data.id !== undefined && this.pendingRequests.has(data.id)) {
        const { resolve, reject } = this.pendingRequests.get(data.id)!;
        this.pendingRequests.delete(data.id);

        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.response);
        }
      }
    };

    this.sendWorkerRequest<void, null>('init', null)
      .then(() => {
        this._railgunInitialised$.next(true);
        console.log('[RailgunFacade] Worker initialized and services started');
      })
      .catch(error => {
        console.error('[RailgunFacade] Failed to initialize worker:', error);
      });
  }

  public async setupFromPassword(password: string): Promise<string> {
    const response = await this.sendWorkerRequest<
      SetupFromPasswordResponse,
      SetupFromPasswordRequest
    >('setupFromPassword', password);
    this.lastUsedPassword = password;
    return response;
  }

  public async unlockFromPassword(password: string): Promise<string> {
    const response = await this.sendWorkerRequest<
      UnlockFromPasswordResponse,
      UnlockFromPasswordRequest
    >('unlockFromPassword', {
      password
    });
    this.lastUsedPassword = password;
    return response;
  }

  private async createPrivateWallet(
    phrase: string,
    blockchain: PrivacySupportedNetworks,
    encryptionKey: string
  ): Promise<RailgunWalletInfo> {
    const response = await this.sendWorkerRequest<
      CreatePrivateWalletResponse,
      CreatePrivateWalletRequest
    >('createPrivateWallet', {
      phrase,
      blockchain,
      encryptionKey
    });
    this.storeService.setItem(this.storageKey, response.id);
    return response;
  }

  private async loadWallet(password: string): Promise<RailgunWalletInfo> {
    const railgunId = this.storeService.getItem(this.storageKey) as string;
    if (!railgunId) {
      throw new Error('[RailgunFacade] Railgun ID not found in storage');
    }

    return this.sendWorkerRequest<LoadWalletResponse, LoadWalletRequest>('loadWallet', {
      railgunId,
      password
    });
  }

  public async getEvmWallet(password: string, walletId: string): Promise<string> {
    return this.sendWorkerRequest<GetEvmWalletResponse, WalletCredentialsRequest>('getEvmWallet', {
      password,
      walletId
    });
  }

  private async refreshBalances(walletIds: string[]): Promise<void> {
    const chainRating: Record<RailgunSupportedChain, number> = {
      [BLOCKCHAIN_NAME.POLYGON]: 1,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 2,
      [BLOCKCHAIN_NAME.ARBITRUM]: 3,
      [BLOCKCHAIN_NAME.ETHEREUM]: 4
    };
    const balanceChains = Object.values(fromPrivateToRubicChainMap)
      .map(chain => ({
        type: 0,
        id: blockchainId[chain],
        chainRating: chainRating[chain]
      }))
      .sort((a, b) => a.chainRating - b.chainRating);

    for (const chain of balanceChains) {
      try {
        await new Promise<void>(resolve => {
          this.syncResolvers.set(chain.id, resolve);

          this.sendWorkerRequest('refreshBalances', { chain, walletIds }).catch(() => {
            this.syncResolvers.delete(chain.id);
            resolve();
          });
        });
      } catch (error) {
        console.error(`[RailgunFacade] Error syncing chain ${chain.id}:`, error);
        this.syncResolvers.delete(chain.id);
      }
    }
  }

  private async handleAccount(account: PublicAccount): Promise<void> {
    try {
      const rubicChain = this._selectedBlockchain$.value;
      const railgunChain = fromRubicToPrivateChainMap[rubicChain];

      const hasWallet = !!this.storeService.getItem(this.storageKey);

      const encryptionKeys = hasWallet
        ? await this.unlockFromPassword(account.password)
        : await this.setupFromPassword(account.password);

      const walletInfo = hasWallet
        ? await this.loadWallet(account.password)
        : await this.createPrivateWallet(account.phrase, railgunChain, encryptionKeys);

      const evmWallet = await this.getEvmWallet(account.password, walletInfo.id);

      this._railgunAccount$.next({ ...walletInfo, evmWalletAddress: evmWallet });
      this.lastUsedPassword = account.password;

      this.refreshBalances([walletInfo.id]);
    } catch (error) {
      console.warn('[RailgunFacade] Account handling failed:', error);
    }
  }

  public setAccount(account: PublicAccount): void {
    this._account$.next(account);
  }

  public getMnemonic(): Promise<string> {
    const password = this.lastUsedPassword;
    const walletId = this.storeService.getItem(this.storageKey) as string;

    return this.sendWorkerRequest<GetMnemonicResponse, WalletCredentialsRequest>('getMnemonic', {
      password,
      walletId
    });
  }

  public async gasEstimateForShield(
    network: PrivacySupportedNetworks,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<{ gasEstimate: bigint }> {
    const shieldPrivateKey = await getShieldSignature(wallet);
    const fromWalletAddress = wallet.address;

    return this.sendWorkerRequest<GasEstimateResponse, GasEstimateForShieldRequest>(
      'gasEstimateForShield',
      {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        nftAmountRecipients: [],
        fromWalletAddress
      }
    );
  }

  public async gasEstimateForShieldNative(
    network: PrivacySupportedNetworks,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<{ gasEstimate: bigint }> {
    const shieldPrivateKey = await getShieldSignature(wallet);
    const fromWalletAddress = wallet.address;
    const { railgunAddress } = await firstValueFrom(this.railgunAccount$);

    return this.sendWorkerRequest<GasEstimateResponse, GasEstimateForShieldNativeRequest>(
      'gasEstimateForShieldNative',
      {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        railgunAddress,
        fromWalletAddress
      }
    );
  }

  public async populateShield(
    network: PrivacySupportedNetworks,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    shieldPrivateKey: string,
    gasDetails: TransactionGasDetails
  ): Promise<{ transaction: ContractTransaction; nullifiers: string[] }> {
    return this.sendWorkerRequest<PopulateResponse, PopulateShieldRequest>('populateShield', {
      txIdVersion: TXIDVersion.V2_PoseidonMerkle,
      network,
      shieldPrivateKey,
      erc20AmountRecipients,
      nftAmountRecipients: [],
      gasDetails
    });
  }

  public async populateShieldNative(
    network: PrivacySupportedNetworks,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    shieldPrivateKey: string,
    gasDetails: TransactionGasDetails
  ): Promise<{ transaction: ContractTransaction; nullifiers: string[] }> {
    const { railgunAddress } = await firstValueFrom(this.railgunAccount$);

    return this.sendWorkerRequest<PopulateResponse, PopulateShieldNativeRequest>(
      'populateShieldNative',
      {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        railgunAddress,
        gasDetails
      }
    );
  }

  public async gasEstimateForUnshield(
    network: PrivacySupportedNetworks,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<{ gasEstimate: bigint }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;
    const mnemonic = await this.getMnemonic();
    const blockchain = fromPrivateToRubicChainMap[network];
    const { wallet } = getProviderWallet(blockchain, mnemonic);
    const gasDetails = await getGasDetailsForTransaction(network, 0n, true, wallet);

    return this.sendWorkerRequest<GasEstimateResponse, GasEstimateForUnshieldRequest>(
      'gasEstimateForUnshield',
      {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId,
        password: this.lastUsedPassword,
        gasDetails,
        erc20AmountRecipients
      }
    );
  }

  public async generateUnshieldProof(
    network: PrivacySupportedNetworks,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    proofProgress: (progress: string) => void = progress =>
      console.log('Proof generation progress... ', progress)
  ): Promise<{ gasEstimate: bigint }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;
    const id = ++this.messageIdCounter;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      const progressHandler = ({ data }: MessageEvent) => {
        if (data.id === id && data.method === 'generateUnshieldProofProgress') {
          proofProgress(data.response);
        }
      };

      this.railgunWorker.addEventListener('message', progressHandler);

      this.sendWorkerRequest<GasEstimateResponse, GenerateUnshieldProofRequest>(
        'generateUnshieldProof',
        {
          txIdVersion: TXIDVersion.V2_PoseidonMerkle,
          network,
          walletId,
          password: this.lastUsedPassword,
          erc20AmountRecipients
        }
      )
        .then(res => {
          this.railgunWorker.removeEventListener('message', progressHandler);
          resolve(res);
        })
        .catch(err => {
          this.railgunWorker.removeEventListener('message', progressHandler);
          reject(err);
        });
    });
  }

  public async populateUnshield(
    network: PrivacySupportedNetworks,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    gasDetails: TransactionGasDetails,
    overallBatchMinGasPrice: bigint
  ): Promise<{ transaction: ContractTransaction; nullifiers: string[] }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;

    return this.sendWorkerRequest<PopulateResponse, PopulateUnshieldRequest>('populateUnshield', {
      txIdVersion: TXIDVersion.V2_PoseidonMerkle,
      network,
      walletId,
      erc20AmountRecipients,
      gasDetails,
      overallBatchMinGasPrice
    });
  }

  public async gasEstimateForTransfer(
    network: PrivacySupportedNetworks,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<{ gasEstimate: bigint }> {
    const account = await firstValueFrom(this.railgunAccount$);
    if (!account) throw new Error('Railgun account not found');

    const mnemonic = await this.getMnemonic();
    const blockchain = fromPrivateToRubicChainMap[network];
    const { wallet } = getProviderWallet(blockchain, mnemonic);
    const gasDetails = await getGasDetailsForTransaction(network, 0n, true, wallet);

    return this.sendWorkerRequest<GasEstimateResponse, GasEstimateForTransferRequest>(
      'gasEstimateForTransfer',
      {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId: account.id,
        password: this.lastUsedPassword,
        gasDetails,
        erc20AmountRecipients
      }
    );
  }

  public async generateTransferProof(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    proofProgress: (progress: string) => void = progress =>
      console.log('Proof generation progress... ', progress)
  ): Promise<{ gasEstimate: bigint }> {
    const account = await firstValueFrom(this.railgunAccount$);
    if (!account) throw new Error('Railgun account not found');

    const id = ++this.messageIdCounter;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const progressHandler = (event: MessageEvent) => {
        const { data } = event;
        if (data.id === id && data.method === 'generateTransferProofProgress') {
          proofProgress(data.response as string);
        }
      };

      this.railgunWorker.addEventListener('message', progressHandler);

      this.sendWorkerRequest<GasEstimateResponse, GenerateTransferProofRequest>(
        'generateTransferProof',
        {
          txIdVersion: TXIDVersion.V2_PoseidonMerkle,
          network,
          walletId: account.id,
          password: this.lastUsedPassword,
          erc20AmountRecipients
        }
      )
        .then(res => {
          this.railgunWorker.removeEventListener('message', progressHandler);
          resolve(res);
        })
        .catch(err => {
          this.railgunWorker.removeEventListener('message', progressHandler);
          reject(err);
        });
    });
  }

  public async populateTransfer(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    gasDetails: TransactionGasDetails,
    overallBatchMinGasPrice: bigint
  ): Promise<{ transaction: ContractTransaction; nullifiers: string[] }> {
    const account = await firstValueFrom(this.railgunAccount$);
    if (!account) throw new Error('Railgun account not found');

    return this.sendWorkerRequest<PopulateResponse, PopulateTransferRequest>('populateTransfer', {
      txIdVersion: TXIDVersion.V2_PoseidonMerkle,
      network,
      walletId: account.id,
      erc20AmountRecipients,
      gasDetails,
      overallBatchMinGasPrice
    });
  }

  public logout(): void {
    this.storeService.deleteItem(this.storageKey);
    this.lastUsedPassword = '';

    this._account$.next(null);
    this._railgunAccount$.next(null);

    this._utxoScan$.next({
      [BLOCKCHAIN_NAME.ETHEREUM]: 0,
      [BLOCKCHAIN_NAME.ARBITRUM]: 0,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 0,
      [BLOCKCHAIN_NAME.POLYGON]: 0
    });

    this._balancesByBucket$.next({
      [BLOCKCHAIN_NAME.POLYGON]: {},
      [BLOCKCHAIN_NAME.ARBITRUM]: {},
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {},
      [BLOCKCHAIN_NAME.ETHEREUM]: {}
    });
  }

  private sendWorkerRequest<T, P extends unknown>(method: string, params: P): Promise<T> {
    const id = ++this.messageIdCounter;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.railgunWorker.postMessage({ id, method, params });
    });
  }

  private handleBalanceUpdate(eventData: RailgunBalancesEvent): void {
    try {
      const blockchain = BlockchainsInfo.getBlockchainNameById(
        eventData.chain.id
      ) as RailgunSupportedChain;

      if (!blockchain) {
        console.warn(`[RailgunFacade] Unknown blockchain ID: ${eventData.chain.id}`);
        return;
      }

      const currentBalances = this._balancesByBucket$.value;

      this._balancesByBucket$.next({
        ...currentBalances,
        [blockchain]: {
          ...currentBalances[blockchain],
          [eventData.balanceBucket]: eventData
        }
      });
    } catch (error) {
      console.error('[RailgunFacade] Error during balance update handling:', error);
    }
  }

  private handleUtxoScanUpdate(eventData: MerkletreeScanUpdateEvent): void {
    try {
      const blockchain = BlockchainsInfo.getBlockchainNameById(
        eventData.chain.id
      ) as RailgunSupportedChain;
      if (!blockchain) return;

      const previousProgress = this._utxoScan$.value[blockchain] || 0;
      let progressPercent: number;

      if (eventData.progress === 0) {
        progressPercent = previousProgress === 100 ? 100 : 0;
      } else {
        progressPercent = Number(new BigNumber(eventData.progress).multipliedBy(100).toFixed(0));
      }

      const hasSignificantChange =
        Math.abs(this._utxoScan$.value[blockchain] - progressPercent) >= 1;

      if (hasSignificantChange || progressPercent === 100) {
        this._utxoScan$.next({
          ...this._utxoScan$.value,
          [blockchain]: progressPercent
        });
      }

      const isFinished =
        progressPercent === 100 || (eventData.progress === 0 && previousProgress > 0);

      if (isFinished) {
        const resolve = this.syncResolvers.get(eventData.chain.id);
        if (resolve) {
          resolve();
          this.syncResolvers.delete(eventData.chain.id);
        }
      }
    } catch (error) {
      console.error('[RailgunFacade] Error during UTXO scan update handling:', error);
      const resolve = this.syncResolvers.get(eventData.chain.id);
      if (resolve) {
        resolve();
        this.syncResolvers.delete(eventData.chain.id);
      }
    }
  }

  public setShieldedTokens(tokens: ShieldedBalanceToken[]): void {
    this._shieldedTokens$.next(tokens);
  }
}
