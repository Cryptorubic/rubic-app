import { rpcList } from '@app/shared/constants/blockchain/rpc-list';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  EncryptionService,
  getBalanceFromUtxos,
  getBalanceFromUtxosSPL,
  getUtxos,
  getUtxosSPL
} from 'privacycash/utils';
import { PrivacycashInWorkerMsg } from './models/worker-models';
import { compareAddresses, isNil } from '@app/shared/utils/utils';
import { WRAP_SOL_ADDRESS } from '../../../../constants/privacycash-consts';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

class PrivacycashWorkerManager {
  private readonly _encryptionService: EncryptionService = new EncryptionService();

  private readonly connection: Connection;

  private _localStorage: RubicAny;

  private _abortController: AbortController = new AbortController();

  public get encryptionService(): EncryptionService {
    return this._encryptionService;
  }

  constructor() {
    this._encryptionService = new EncryptionService();
    this.connection = new Connection(rpcList.SOLANA[0], 'confirmed');
  }

  public setSignature(signature: Uint8Array): void {
    this.encryptionService.deriveEncryptionKeyFromSignature(signature);
  }

  public setLocalStorage(localStorage: RubicAny): void {
    this._localStorage = localStorage;
  }

  public resetAbortController(): void {
    this._abortController = new AbortController();
  }

  public abortAbortController(): void {
    this._abortController.abort();
  }

  public getPrivacyCashBalance: (
    tokenAddr: string,
    walletAddr: string,
    useCache: boolean
  ) => Promise<number> = this.getPrivacyCashBalanceFnFactory();

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   */
  private getPrivacyCashBalanceFnFactory(): (
    tokenAddr: string,
    walletAddr: string,
    useCache: boolean
  ) => Promise<number> {
    const cache = {} as Record<string, number>;
    const getCacheKey = (tokenAddr: string, walletPK: PublicKey): string => {
      return `${walletPK.toBase58()}::${tokenAddr}`;
    };
    return async (
      tokenAddr: string,
      walletAddr: string,
      useCache: boolean = true
    ): Promise<number> => {
      const walletPK = new PublicKey(walletAddr);
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
    console.debug(
      '[PrivacycashTokensService_fetchPrivacyCashBalance] loading balances started for ',
      tokenAddr
    );
    try {
      if (compareAddresses(tokenAddr, WRAP_SOL_ADDRESS)) {
        const utxos = await getUtxos({
          publicKey: walletPK,
          connection: this.connection,
          encryptionService: this.encryptionService,
          storage: this._localStorage,
          abortSignal: this._abortController.signal
        });
        const res = getBalanceFromUtxos(utxos);
        console.debug('✅ Successfull getBalance!');

        return res.lamports;
      }

      const utxos = await getUtxosSPL({
        publicKey: walletPK,
        connection: this.connection,
        encryptionService: this.encryptionService,
        storage: this._localStorage,
        mintAddress: new PublicKey(tokenAddr),
        abortSignal: this._abortController.signal
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
    }
  }
}

const workerManager = new PrivacycashWorkerManager();

addEventListener('message', ({ data }: { data: PrivacycashInWorkerMsg }) => {
  if (data.type === 'init') {
    workerManager.setSignature(data.data.signature);
    workerManager.resetAbortController();
  } else if (data.type === 'getBalances') {
    // workerManager;
  } else if (data.type === 'stop') {
    workerManager.abortAbortController();
  } else {
    const response = `privacycash-worker message:`;
    postMessage(response);
  }
});
