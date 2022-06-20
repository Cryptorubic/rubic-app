import { Injectable } from '@angular/core';
import SDK, {
  Configuration,
  CrossChainManager,
  InstantTradesManager,
  TokensManager
} from 'rubic-sdk';
import { rubicSdkDefaultConfig } from '@features/swaps/core/services/rubic-sdk-service/constants/rubic-sdk-default-config';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable()
export class RubicSdkService {
  private _SDK: SDK | null;

  private readonly _sdkLoading$ = new BehaviorSubject<boolean>(true);

  public readonly sdkLoading$ = this._sdkLoading$.asObservable();

  private readonly _walletLoading$ = new BehaviorSubject<boolean>(false);

  public readonly walletLoading$ = this._walletLoading$.asObservable().pipe(debounceTime(200));

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

  constructor(/* private readonly walletConnectorService: WalletConnectorService */) {
    this._SDK = null;
    this.initSDK();
    // this.initSubscription();
  }

  // walletProvider: {
  //   address: '0x8796e04d35bA0251Fa71d9bC89937bED766970E3',
  //   chainId: 56,
  //   //@ts-ignore
  //   core: window.ethereum
  // }

  private async initSDK(): Promise<void> {
    this.SDK = await SDK.createSDK(this.defaultConfig);
    this.currentConfig = this.defaultConfig;
    this._sdkLoading$.next(false);
  }

  public async patchConfig(config: Partial<Configuration>): Promise<void> {
    await this.SDK.updateConfiguration({
      ...this.currentConfig,
      ...config
    });
  }

  // private initSubscription(): void {
  //   combineLatest([
  //     this.walletConnectorService.addressChange$,
  //     this.walletConnectorService.networkChange$,
  //     this.sdkLoading$.pipe(filter(sdkLoading => !sdkLoading))
  //   ])
  //     .pipe(debounceTime(100))
  //     .subscribe(([address, network]) => {
  //       this._walletLoading$.next(true);
  //       return this.patchConfig({
  //         walletProvider:
  //           address && network
  //             ? {
  //                 address,
  //                 chainId: network.id,
  //                 core: this.walletConnectorService.provider.wallet
  //               }
  //             : undefined
  //       }).then(() => {
  //         this._walletLoading$.next(false);
  //       });
  //     });
  // }
}
