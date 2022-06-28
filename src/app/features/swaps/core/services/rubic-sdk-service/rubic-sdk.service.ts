import { Injectable } from '@angular/core';
import SDK, {
  Configuration,
  CrossChainManager,
  InstantTradesManager,
  TokensManager
} from 'rubic-sdk';
import { rubicSdkDefaultConfig } from '@features/swaps/core/services/rubic-sdk-service/constants/rubic-sdk-default-config';
import { BehaviorSubject } from 'rxjs';

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

  public get tokens(): TokensManager {
    return this.SDK.tokens;
  }

  public get instantTrade(): InstantTradesManager {
    return this.SDK.instantTrades;
  }

  public get crossChain(): CrossChainManager {
    return this.SDK.crossChain;
  }

  private set SDK(value: SDK) {
    this._SDK = value;
  }

  private readonly defaultConfig = rubicSdkDefaultConfig;

  private currentConfig: Configuration;

  constructor() {
    this._SDK = null;
  }

  public async initSDK(): Promise<void> {
    this.SDK = await SDK.createSDK(this.defaultConfig);
    this.currentConfig = this.defaultConfig;
  }

  public async patchConfig(config: Partial<Configuration>): Promise<void> {
    this._sdkLoading$.next(true);
    try {
      await this.SDK.updateConfiguration({
        ...this.currentConfig,
        ...config
      });
    } catch {
      console.debug('Failed to reload SDK configuration.');
    }
    this._sdkLoading$.next(false);
  }
}
