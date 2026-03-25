import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { getMinimalTokensByChain } from './utils/get-minimal-tokens-by-chain';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { MinimalTokenWithBalance } from '../../../models/privacycash-tokens-facade-models';
import { toPrivacyCashTokenAddr } from '../../../utils/converter';
import { PublicKey } from '@solana/web3.js';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import BigNumber from 'bignumber.js';
import { PrivacycashSignatureService } from '../../privacy-cash-signature.service';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { compareAddresses, isNil } from '@app/shared/utils/utils';
import { WRAP_SOL_ADDRESS } from '../../../constants/privacycash-consts';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import {
  getBalanceFromUtxos,
  getBalanceFromUtxosSPL,
  getUtxos,
  getUtxosSPL
} from 'privacycash/utils';

@Injectable()
export class PrivacycashTokensService {
  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  private readonly adapterFactory = inject(BlockchainAdapterFactoryService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly _updateBalances$ = new BehaviorSubject<boolean>(false);

  public readonly updateBalances$ = this._updateBalances$.asObservable();

  private readonly _tokens$ = new BehaviorSubject<MinimalTokenWithBalance[]>(
    this.initializeTokensList()
  );

  public readonly tokens$ = this._tokens$.asObservable();

  private readonly _utxosLoadingState$ = new BehaviorSubject<{ [tokenAddr: string]: boolean }>({});

  /**
   * Emits true when any token loads private balances
   */
  public readonly loading$ = this._utxosLoadingState$.pipe(
    map(loadingState => Object.values(loadingState).some(loading => loading))
  );

  private setLoadingState(tokenAddr: string, loading: boolean): void {
    this._utxosLoadingState$.next({ ...this._utxosLoadingState$.value, [tokenAddr]: loading });
  }

  /**
   * used to stop fetching utxos, when wallet disconnected
   */
  private _abortController: AbortController = new AbortController();

  private readonly worker = new Worker(new URL('./worker/privacycash.worker.ts', import.meta.url));

  public get abortController(): AbortController {
    return this._abortController;
  }

  public resetAbortController(): void {
    this._abortController = new AbortController();
  }

  public updatePrivateBalances(): void {
    this._updateBalances$.next(true);
  }

  private initializeTokensList(): MinimalTokenWithBalance[] {
    const pcAllSupportedMinimalTokens: MinimalToken[] = getMinimalTokensByChain('allChains');
    return pcAllSupportedMinimalTokens.map(minimalToken => ({
      ...minimalToken,
      balanceWei: new BigNumber(0)
    }));
  }

  public async loadBalances(): Promise<void> {
    const pcAllSupportedMinimalTokens: MinimalToken[] = getMinimalTokensByChain('allChains');
    const pcSupportedTokens: MinimalTokenWithBalance[] = await Promise.all(
      pcAllSupportedMinimalTokens.map(minimalToken => {
        return this.fetchPrivacyCashBalance(
          toPrivacyCashTokenAddr(minimalToken.address),
          new PublicKey(this.walletConnectorService.address)
        ).then(balanceWei => ({
          ...minimalToken,
          balanceWei: new BigNumber(balanceWei)
        }));
      })
    );
    this._tokens$.next(pcSupportedTokens);
  }

  public getPrivacyCashBalance: (
    tokenAddr: string,
    walletPK: PublicKey,
    useCache: boolean
  ) => Promise<number> = this.getPrivacyCashBalanceFnFactory();

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   */
  private getPrivacyCashBalanceFnFactory(): (
    tokenAddr: string,
    walletPK: PublicKey,
    useCache: boolean
  ) => Promise<number> {
    const cache = {} as Record<string, number>;
    const getCacheKey = (tokenAddr: string, walletPK: PublicKey): string => {
      return `${walletPK.toBase58()}::${tokenAddr}`;
    };
    return async (
      tokenAddr: string,
      walletPK: PublicKey,
      useCache: boolean = true
    ): Promise<number> => {
      const cacheKey = getCacheKey(tokenAddr, walletPK);
      const cachedValue = cache[cacheKey];
      if (useCache && !isNil(cachedValue)) return cachedValue;

      const privacyCashBalanceWei = await this.fetchPrivacyCashBalance(tokenAddr, walletPK);
      cache[cacheKey] = privacyCashBalanceWei;

      return privacyCashBalanceWei;
    };
  }

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @returns wei balance on PrivacyCash relayer
   */
  private async fetchPrivacyCashBalance(tokenAddr: string, walletPK: PublicKey): Promise<number> {
    this.setLoadingState(tokenAddr, true);
    console.debug(
      '[PrivacycashTokensService_fetchPrivacyCashBalance] loading balances started for ',
      tokenAddr
    );
    try {
      await this.privacycashSignatureService.checkRequirements();

      const encryptionService = this.privacycashSignatureService.encryptionService;
      const connection = this.adapterFactory.getAdapter(BLOCKCHAIN_NAME.SOLANA).public;

      if (compareAddresses(tokenAddr, WRAP_SOL_ADDRESS)) {
        const utxos = await getUtxos({
          publicKey: walletPK,
          connection,
          encryptionService,
          storage: localStorage,
          abortSignal: this.abortController.signal
        });
        const res = getBalanceFromUtxos(utxos);
        console.debug('✅ Successfull getBalance!');

        return res.lamports;
      }

      const utxos = await getUtxosSPL({
        publicKey: walletPK,
        connection,
        encryptionService,
        storage: localStorage,
        mintAddress: new PublicKey(tokenAddr),
        abortSignal: this.abortController.signal
      });
      const res = getBalanceFromUtxosSPL(utxos);
      console.debug('✅ Successfull getBalance!');

      return res.base_units;
    } catch (err) {
      console.debug('❌ Failed getBalance!', err);
      return 0;
    } finally {
      console.debug(
        '[PrivacycashTokensService_fetchPrivacyCashBalance] loading balances finished for ',
        tokenAddr
      );
      this.setLoadingState(tokenAddr, false);
    }
  }
}
