import { Injectable } from '@angular/core';
import { EvmBlockchainName } from '@cryptorubic/core';
import { createInstance } from '@zama-fhe/relayer-sdk/web';
import { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import { BehaviorSubject } from 'rxjs';
import { ZAMA_INIT_CONFIG } from './constants/zama-init-config';
import { rpcList } from '@app/shared/constants/blockchain/rpc-list';
import { ZAMA_SUPPORTED_CHAINS } from '../../constants/zama-supported-chains';

@Injectable()
export class ZamaInstanceService {
  private readonly _instancesStore$ = new BehaviorSubject<
    Partial<Record<EvmBlockchainName, FhevmInstance>>
  >({});

  public readonly currInstance$ = this._instancesStore$.asObservable();

  public getInstance(blockchain: EvmBlockchainName): FhevmInstance {
    const instance = this._instancesStore$.getValue()[blockchain];

    if (!instance) throw new Error('Zama SDK instance not init');

    return instance;
  }

  public async initInstances(): Promise<void> {
    try {
      const promises = ZAMA_SUPPORTED_CHAINS.map(chain => {
        const liteConfig = ZAMA_INIT_CONFIG[chain];

        return createInstance({
          ...liteConfig,
          network: rpcList[chain][0],
          auth: {
            __type: 'ApiKeyHeader',
            header: 'apiKey',
            value: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4'
          }
        });
      });

      const instances = await Promise.all(promises);

      this._instancesStore$.next(
        Object.fromEntries(ZAMA_SUPPORTED_CHAINS.map((chain, i) => [chain, instances[i]]))
      );
    } catch (err) {
      console.error(`FAILED TO INIT ZAMA INSTANCE: `, err);
    }
  }
}
