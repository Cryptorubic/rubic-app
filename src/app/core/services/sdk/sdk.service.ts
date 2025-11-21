import { Inject, Injectable } from '@angular/core';
import { rubicSdkDefaultConfig } from '@core/services/sdk/constants/rubic-sdk-default-config';
import { BehaviorSubject } from 'rxjs';
import { SdkHttpClient } from '@core/services/sdk/utils/sdk-http-client';
import { HttpClient } from '@angular/common/http';
import { BlockchainName } from '@cryptorubic/core';
import {
  BlockchainAdapterFactoryService as SdkAdapterFactory,
  WalletProviderCore
} from '@cryptorubic/web3';
import { ENVIRONMENT } from 'src/environments/environment';
import { CrossChainSymbiosisManager } from './sdk-legacy/features/cross-chain/symbiosis-manager/cross-chain-symbiosis-manager';
import { OnChainStatusManager } from './sdk-legacy/features/on-chain/status-manager/on-chain-status-manager';
import { CrossChainStatusManager } from './sdk-legacy/features/cross-chain/status-manager/cross-chain-status-manager';
import { SdkLegacyService } from './sdk-legacy/sdk-legacy.service';
import { rpcList } from '@app/shared/constants/blockchain/rpc-list';
import { RubicApiService } from './sdk-legacy/rubic-api/rubic-api.service';
import { WINDOW } from '@ng-web-apis/common';

@Injectable()
export class SdkService {
  private readonly _sdkLoading$ = new BehaviorSubject<boolean>(false);

  public readonly sdkLoading$ = this._sdkLoading$.asObservable();

  public readonly symbiosis: CrossChainSymbiosisManager;

  public readonly onChainStatusManager: OnChainStatusManager;

  public readonly crossChainStatusManager: CrossChainStatusManager;

  // private _currentConfig: Configuration;

  // public get currentConfig(): Configuration {
  //   return this._currentConfig;
  // }

  constructor(
    private readonly angularHttpClient: HttpClient,
    private readonly sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    // this._currentConfig = this.getConfig(this.getProviderAddresses());
    this.onChainStatusManager = new OnChainStatusManager(sdkLegacyService);
    this.crossChainStatusManager = new CrossChainStatusManager(sdkLegacyService, rubicApiService);
    this.symbiosis = new CrossChainSymbiosisManager(sdkLegacyService);
  }

  public async initSDK(): Promise<void> {
    const adapterFactory = await SdkAdapterFactory.createFactory({
      rpcList,
      httpClient: new SdkHttpClient(this.angularHttpClient),
      tonParams: {
        tonApiConfig: {
          tonApiKey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4',
          tonApiUrl: `https://x-api.rubic.exchange/tonapi`
        },
        tonClientConfig: {
          apiKey: '65e9a5af974c9f8e00b726fc25972fd228a49236d960b7bdce9f24ed6c54a45e',
          endpoint: 'https://toncenter.com/api/v2/jsonRPC'
        }
      },
      clientParams: {
        envType: ENVIRONMENT.environmentName,
        lazyLoadWeb3: true,
        viemConfig: rubicSdkDefaultConfig.viemConfig
      }
    });

    console.log('ADAPTERS_FACTORY ==>', adapterFactory.adapterStore);

    this.sdkLegacyService.adaptersFactoryService.setAdapterFactory(adapterFactory);
  }

  // public getConfig(params: {
  //   crossChainIntegratorAddress?: string;
  //   onChainIntegratorAddress?: string;
  // }): Configuration {
  //   const defaultProvidersAddresses = {
  //     crossChain: '0x3fFF9bDEb3147cE13A7FFEf85Dae81874E0AEDbE',
  //     onChain: '0x3b9Ce17A7bD729A0abc5976bEAb6D7d150fbD0d4'
  //   };
  //   const envType = this.getEnvType();

  //   return {
  //     ...rubicSdkDefaultConfig,
  //     httpClient: new SdkHttpClient(this.angularHttpClient),
  //     ...(envType && { envType }),
  //     providerAddress: {
  //       [CHAIN_TYPE.EVM]: {
  //         crossChain: params?.crossChainIntegratorAddress || defaultProvidersAddresses.crossChain,
  //         onChain: params?.onChainIntegratorAddress || defaultProvidersAddresses.onChain
  //       }
  //     }
  //   };
  // }

  public updateWallet(blockchain: BlockchainName, walletProviderCore: WalletProviderCore): void {
    this.sdkLegacyService.adaptersFactoryService.adapterFactory.connectWallet(
      blockchain,
      walletProviderCore
    );
  }

  // private getProviderAddresses(): {
  //   crossChainIntegratorAddress: string;
  //   onChainIntegratorAddress: string;
  // } {
  //   const urlParams = new URLSearchParams(this.window.location.search);
  //   const commonIntegrator = urlParams.get('feeTarget') || urlParams.get('providerAddress');
  //   const crossChainProvider = urlParams.get('crossChainIntegratorAddress') || commonIntegrator;
  //   const onChainProvider = urlParams.get('onChainIntegratorAddress') || commonIntegrator;
  //   const referral = urlParams.get('referral');
  //   const onChainProviderAddress = referralToIntegratorAddressMapping[referral?.toLowerCase()];

  //   return {
  //     crossChainIntegratorAddress: crossChainProvider,
  //     onChainIntegratorAddress: onChainProvider || onChainProviderAddress
  //   };
  // }

  // private getEnvType(): EnvType | null {
  //   return ENVIRONMENT.environmentName || null;
  // }
}
