import { inject, Injectable } from '@angular/core';
import { StoreService } from '@core/services/store/store.service';
import { Store } from '@core/services/store/models/store';
import { BehaviorSubject, firstValueFrom, from, of } from 'rxjs';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { switchTap } from '@shared/utils/utils';
import {
  Chain,
  NetworkName,
  RailgunBalancesEvent,
  RailgunERC20AmountRecipient,
  RailgunWalletBalanceBucket,
  RailgunWalletInfo,
  TransactionGasDetails,
  TXIDVersion
} from '@railgun-community/shared-models';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { RailgunResponse } from '@features/privacy/providers/railgun/services/worker/models';
import BigNumber from 'bignumber.js';
import { HDNodeWallet, Wallet, ContractTransaction } from 'ethers';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  getShieldSignature
} from '@features/privacy/providers/railgun/utils/tx-utils';

@Injectable()
export class RailgunFacadeService {
  private readonly _railgunInitialised$ = new BehaviorSubject<boolean>(false);

  public readonly railgunInitialised$ = this._railgunInitialised$.asObservable();

  private readonly storeService = inject(StoreService);

  private readonly storageKey: keyof Store = 'RAILGUN_ENCRYPTION_CREDS_V1';

  private readonly _balancesByBucket$ = new BehaviorSubject<
    Partial<Record<RailgunWalletBalanceBucket, RailgunBalancesEvent>>
  >({});

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

  private readonly _balances$ = new BehaviorSubject<
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >(null);

  private readonly _utxoScan$ = new BehaviorSubject<number>(0);

  public readonly utxoScan$ = this._utxoScan$.asObservable();

  public readonly balances$ = this._balances$.asObservable();

  private readonly _pendingBalances$ = new BehaviorSubject<
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >(null);

  public readonly pendingBalances$ = this._pendingBalances$.asObservable();

  private railgunWorker = new Worker(new URL('./worker/railgun.worker', import.meta.url), {
    type: 'module'
  });

  public initService(): void {
    this.railgunWorker.postMessage({ method: 'init', params: null });
    this.railgunWorker.onmessage = ({ data }) => {
      if (data === 'initialized') {
        console.log('Railgun service initialized');
        this._railgunInitialised$.next(true);
      }
    };
  }

  public lastUsedPassword = '';

  public async setupFromPassword(password: string): Promise<string> {
    this.railgunWorker.postMessage({ method: 'setupFromPassword', params: password });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<string> }) => {
        if (data.method === 'setupFromPassword') {
          this.lastUsedPassword = password;
          resolve(data.response);
        }
      };
    });
  }

  public async unlockFromPassword(password: string): Promise<string> {
    this.railgunWorker.postMessage({ method: 'unlockFromPassword', params: { password } });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<string> }) => {
        if (data.method === 'unlockFromPassword') {
          this.lastUsedPassword = password;
          resolve(data.response);
        }
      };
    });
  }

  private createPrivateWallet(
    phrase: string,
    blockchain: PrivacySupportedNetworks,
    encryptionKey: string
  ): Promise<RailgunWalletInfo> {
    this.railgunWorker.postMessage({
      method: 'createPrivateWallet',
      params: { phrase, blockchain, encryptionKey }
    });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<RailgunWalletInfo> }) => {
        if (data.method === 'createPrivateWallet') {
          this.storeService.setItem(this.storageKey, data.response.id);
          resolve(data.response);
        }
      };
    });
  }

  private loadWallet(password: string): Promise<RailgunWalletInfo> {
    const railgunId = this.storeService.getItem(this.storageKey);

    this.railgunWorker.postMessage({
      method: 'loadWallet',
      params: { railgunId, password }
    });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<RailgunWalletInfo> }) => {
        if (data.method === 'loadWallet') {
          resolve(data.response);
        }
      };
    });
  }

  public getEvmWallet(password: string, walletId: string): Promise<string> {
    this.railgunWorker.postMessage({
      method: 'getEvmWallet',
      params: { password, walletId }
    });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<string> }) => {
        if (data.method === 'getEvmWallet') {
          resolve(data.response);
        }
      };
    });
  }

  private async refreshBalances(chain: Chain, walletIds: string[]): Promise<void> {
    this.railgunWorker.postMessage({
      method: 'refreshBalances',
      params: { chain, walletIds }
    });
    this.railgunWorker.onmessage = ({
      data
    }: {
      data: RailgunResponse<RailgunBalancesEvent | string>;
    }) => {
      if (data.method === 'balanceUpdate') {
        const eventData = data.response as RailgunBalancesEvent;
        const prev = this._balancesByBucket$.value;
        this._balancesByBucket$.next({
          ...prev,
          [eventData.balanceBucket]: eventData
        });
      }
      if (data.method === 'utxoScanUpdate') {
        const eventData = data.response as string;
        const bigNumber = new BigNumber(eventData);
        const progress = bigNumber.multipliedBy(100).toFixed(2);
        const number = Number(progress);
        this._utxoScan$.next(number);
      }
    };
  }

  private async handleAccount(account: PublicAccount): Promise<void> {
    try {
      const hasWallet = !!this.storeService.getItem(this.storageKey);

      const encryptionKeys = hasWallet
        ? await this.unlockFromPassword(account.password)
        : await this.setupFromPassword(account.password);

      const walletInfo = hasWallet
        ? await this.loadWallet(account.password)
        : await this.createPrivateWallet(account.phrase, 'Polygon' as RubicAny, encryptionKeys);

      const evmWallet = await this.getEvmWallet(account.password, walletInfo.id);

      this._railgunAccount$.next({ ...walletInfo, evmWalletAddress: evmWallet });
      this.lastUsedPassword = account.password;

      await this.refreshBalances({ type: 0, id: 137 }, [walletInfo.id]);

      this.balancesSnapshot$.subscribe(update => {
        if (update?.Spendable) {
          const blockchain = BlockchainsInfo.getBlockchainNameById(update?.Spendable.chain.id);
          const tokens = update?.Spendable.erc20Amounts
            .filter(el => el.amount !== BigInt(0))
            .map(token => ({
              blockchain,
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            }));
          this._balances$.next(tokens);
        } else {
          this._balances$.next([]);
        }
        if (update?.ShieldPending) {
          const blockchain = BlockchainsInfo.getBlockchainNameById(update?.ShieldPending.chain.id);
          const tokens = update?.ShieldPending.erc20Amounts
            .filter(el => el.amount !== BigInt(0))
            .map(token => ({
              blockchain,
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            }));
          this._pendingBalances$.next(tokens);
        }
      });
    } catch (error) {
      console.warn(error);
    }
  }

  public setAccount(account: PublicAccount): void {
    this._account$.next(account);
  }

  public getMnemonic(): Promise<string> {
    const password = this.lastUsedPassword;
    const walletId = this.storeService.getItem(this.storageKey);

    this.railgunWorker.postMessage({ method: 'getMnemonic', params: { password, walletId } });
    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({ data }: { data: RailgunResponse<string> }) => {
        if (data.method === 'getMnemonic') {
          resolve(data.response);
        }
      };
    });
  }

  public async gasEstimateForShield(
    network: NetworkName,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<{ gasEstimate: bigint }> {
    const shieldPrivateKey = await getShieldSignature(wallet);
    // Address of public wallet we are shielding from
    const fromWalletAddress = wallet.address;

    this.railgunWorker.postMessage({
      method: 'gasEstimateForShield',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        nftAmountRecipients: [], // nftAmountRecipients
        fromWalletAddress
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ gasEstimate: bigint }>;
      }) => {
        if (data.method === 'gasEstimateForShield') {
          resolve(data.response);
        }
      };
    });
  }

  public async populateShield(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    shieldPrivateKey: string,
    gasDetails: TransactionGasDetails
  ): Promise<{ transaction: ContractTransaction; nullifiers: string[] }> {
    this.railgunWorker.postMessage({
      method: 'populateShield',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        nftAmountRecipients: [],
        gasDetails: gasDetails
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ transaction: ContractTransaction; nullifiers: string[] }>;
      }) => {
        if (data.method === 'populateShield') {
          resolve(data.response);
        }
      };
    });
  }

  public async gasEstimateForUnshield(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<{ gasEstimate: bigint }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;
    const mnemonic = await this.getMnemonic();
    const { wallet } = getProviderWallet(BLOCKCHAIN_NAME.POLYGON, mnemonic);
    const gasDetails = await getGasDetailsForTransaction(network, 0n, true, wallet);

    this.railgunWorker.postMessage({
      method: 'gasEstimateForUnshield',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId,
        password: this.lastUsedPassword,
        gasDetails,
        erc20AmountRecipients
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ gasEstimate: bigint }>;
      }) => {
        if (data.method === 'gasEstimateForUnshield') {
          resolve(data.response);
        }
      };
    });
  }

  public async generateUnshieldProof(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    proofProgress: (progress: string) => void = progress =>
      console.log('Proof generation progress... ', progress)
  ): Promise<{ gasEstimate: bigint }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;

    this.railgunWorker.postMessage({
      method: 'generateUnshieldProof',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId,
        password: this.lastUsedPassword,
        erc20AmountRecipients
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ gasEstimate: bigint } | string>;
      }) => {
        if (data.method === 'generateUnshieldProofProgress') {
          proofProgress(data.response as string);
        }
        if (data.method === 'generateUnshieldProof') {
          resolve(data.response as { gasEstimate: bigint });
        }
      };
    });
  }

  public async populateUnshield(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    gasDetails: TransactionGasDetails,
    overallBatchMinGasPrice: bigint
  ): Promise<{ transaction: ContractTransaction; nullifiers: string[] }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;

    this.railgunWorker.postMessage({
      method: 'populateUnshield',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId,
        erc20AmountRecipients,
        gasDetails: gasDetails,
        overallBatchMinGasPrice
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ transaction: ContractTransaction; nullifiers: string[] }>;
      }) => {
        if (data.method === 'populateUnshield') {
          resolve(data.response);
        }
      };
    });
  }

  public async gasEstimateForTransfer(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<{ gasEstimate: bigint }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;
    const mnemonic = await this.getMnemonic();
    const { wallet } = getProviderWallet(BLOCKCHAIN_NAME.POLYGON, mnemonic);
    const gasDetails = await getGasDetailsForTransaction(network, 0n, true, wallet);

    this.railgunWorker.postMessage({
      method: 'gasEstimateForTransfer',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId,
        password: this.lastUsedPassword,
        gasDetails,
        erc20AmountRecipients
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ gasEstimate: bigint }>;
      }) => {
        if (data.method === 'gasEstimateForTransfer') {
          resolve(data.response);
        }
      };
    });
  }

  public async generateTransferProof(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    proofProgress: (progress: string) => void = progress =>
      console.log('Proof generation progress... ', progress)
  ): Promise<{ gasEstimate: bigint }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;

    this.railgunWorker.postMessage({
      method: 'generateTransferProof',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId,
        password: this.lastUsedPassword,
        erc20AmountRecipients
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ gasEstimate: bigint } | string>;
      }) => {
        if (data.method === 'generateTransferProofProgress') {
          proofProgress(data.response as string);
        }
        if (data.method === 'generateTransferProof') {
          resolve(data.response as { gasEstimate: bigint });
        }
      };
    });
  }

  public async populateTransfer(
    network: NetworkName,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    gasDetails: TransactionGasDetails,
    overallBatchMinGasPrice: bigint
  ): Promise<{ transaction: ContractTransaction; nullifiers: string[] }> {
    const walletId = (await firstValueFrom(this.railgunAccount$)).id;

    this.railgunWorker.postMessage({
      method: 'populateTransfer',
      params: {
        txIdVersion: TXIDVersion.V2_PoseidonMerkle,
        network,
        walletId,
        erc20AmountRecipients,
        gasDetails: gasDetails,
        overallBatchMinGasPrice
      }
    });

    return new Promise(resolve => {
      this.railgunWorker.onmessage = ({
        data
      }: {
        data: RailgunResponse<{ transaction: ContractTransaction; nullifiers: string[] }>;
      }) => {
        if (data.method === 'populateTransfer') {
          resolve(data.response);
        }
      };
    });
  }
}
