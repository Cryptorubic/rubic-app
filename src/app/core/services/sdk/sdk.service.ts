import { Inject, Injectable } from '@angular/core';
import {
  CHAIN_TYPE,
  Configuration,
  CrossChainManager,
  CrossChainStatusManager,
  CrossChainSymbiosisManager,
  DeflationTokenManager,
  OnChainManager,
  OnChainStatusManager,
  SDK,
  WalletProvider,
  WalletProviderCore
} from 'rubic-sdk';
import { rubicSdkDefaultConfig } from '@core/services/sdk/constants/rubic-sdk-default-config';
import { BehaviorSubject } from 'rxjs';
import { SdkHttpClient } from '@core/services/sdk/utils/sdk-http-client';
import { HttpClient } from '@angular/common/http';
import { WINDOW } from '@ng-web-apis/common';

type EnvType = 'local' | 'dev2' | 'dev' | 'prod' | 'rubic';

@Injectable()
export class SdkService {
  private readonly _sdkLoading$ = new BehaviorSubject<boolean>(false);

  public readonly sdkLoading$ = this._sdkLoading$.asObservable();

  private _SDK: SDK | null;

  private get SDK(): SDK {
    if (!this._SDK) {
      throw new Error('Rubic SDK is not initiated.');
    }
    return this._SDK;
  }

  public get symbiosis(): CrossChainSymbiosisManager {
    return this.SDK.crossChainSymbiosisManager;
  }

  public get instantTrade(): OnChainManager {
    return this.SDK.onChainManager;
  }

  public get deflationTokenManager(): DeflationTokenManager {
    return this.SDK.deflationTokenManager;
  }

  public get crossChain(): CrossChainManager {
    return this.SDK.crossChainManager;
  }

  public get onChainStatusManager(): OnChainStatusManager {
    return this.SDK.onChainStatusManager;
  }

  public get crossChainStatusManager(): CrossChainStatusManager {
    return this.SDK.crossChainStatusManager;
  }

  private set SDK(value: SDK) {
    this._SDK = value;
  }

  private _currentConfig: Configuration;

  public get currentConfig(): Configuration {
    return this._currentConfig;
  }

  constructor(
    private readonly angularHttpClient: HttpClient,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this._SDK = null;
  }

  public async initSDK(params: {
    crossChainIntegratorAddress?: string;
    onChainIntegratorAddress?: string;
  }): Promise<void> {
    this._currentConfig = this.getConfig(params);
    this.SDK = await SDK.createSDK(this.currentConfig);
  }

  public getConfig(params: {
    crossChainIntegratorAddress?: string;
    onChainIntegratorAddress?: string;
  }): Configuration {
    const defaultProvidersAddresses = {
      crossChain: '0x3fFF9bDEb3147cE13A7FFEf85Dae81874E0AEDbE',
      onChain: '0x3b9Ce17A7bD729A0abc5976bEAb6D7d150fbD0d4'
    };

    const envType = this.getEnvType();
    return {
      ...rubicSdkDefaultConfig,
      httpClient: new SdkHttpClient(this.angularHttpClient),
      ...(envType && { envType }),
      providerAddress: {
        [CHAIN_TYPE.EVM]: {
          crossChain: params?.crossChainIntegratorAddress || defaultProvidersAddresses.crossChain,
          onChain: params?.onChainIntegratorAddress || defaultProvidersAddresses.onChain
        }
      }
    };
  }

  public updateWallet(
    chainType: keyof WalletProvider,
    walletProviderCore: WalletProviderCore
  ): void {
    this.SDK.updateWalletProviderCore(chainType, walletProviderCore);
  }

  private getEnvType(): EnvType | null {
    const map: Record<string, string> = {
      'dev-app.rubic.exchange': 'dev',
      'dev2-app.rubic.exchange': 'dev2',
      'dev3-app.rubic.exchange': 'dev',
      'stage-app.rubic.exchange': 'rubic',
      'beta-app.rubic.exchange': 'rubic',
      'app.rubic.exchange': 'rubic',
      'local.rubic.exchange': 'local'
    };

    const host = this?.window?.location?.hostname;
    const apiEnv = map?.[host] as EnvType | undefined;

    return apiEnv || null;
  }
}
