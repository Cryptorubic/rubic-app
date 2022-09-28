import { Injectable } from '@angular/core';
import {
  Configuration,
  CrossChainManager,
  CrossChainStatusManager,
  OnChainManager,
  OnChainStatusManager,
  SDK,
  WalletProvider,
  WalletProviderCore
} from 'rubic-sdk';
import { rubicSdkDefaultConfig } from '@features/swaps/core/services/rubic-sdk-service/constants/rubic-sdk-default-config';
import { BehaviorSubject } from 'rxjs';
import { CrossChainSymbiosisManager } from 'rubic-sdk/lib/features/cross-chain/cross-chain-symbiosis-manager';
import { SdkHttpClient } from '@features/swaps/core/services/rubic-sdk-service/utils/sdk-http-client';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RubicSdkService {
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

  public readonly defaultConfig = {
    ...rubicSdkDefaultConfig,
    httpClient: new SdkHttpClient(this.angularHttpClient)
  };

  private currentConfig: Configuration;

  constructor(private readonly angularHttpClient: HttpClient) {
    this._SDK = null;
  }

  public async initSDK(): Promise<void> {
    this.SDK = await SDK.createSDK(this.defaultConfig);
    this.currentConfig = this.defaultConfig;
  }

  public async patchConfig(config: Partial<Configuration>): Promise<void> {
    this._sdkLoading$.next(true);
    try {
      const newConfig = { ...this.currentConfig, ...config };
      await this.SDK.updateConfiguration(newConfig);
      this.currentConfig = newConfig;
    } catch (err) {
      console.debug('Failed to reload SDK configuration:', err);
    }
    this._sdkLoading$.next(false);
  }

  public updateWallet(
    chainType: keyof WalletProvider,
    walletProviderCore: WalletProviderCore
  ): void {
    this.SDK.updateWalletProviderCore(chainType, walletProviderCore);
  }
}
