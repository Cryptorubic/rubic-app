import { Inject, Injectable } from '@angular/core';
import { SdkService } from '@core/services/sdk/sdk.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, tap } from 'rxjs/operators';
import { CHAIN_TYPE, WalletProvider, WalletProviderCore } from 'rubic-sdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WINDOW } from '@ng-web-apis/common';

@Injectable()
export class SdkLoaderService {
  constructor(
    private readonly sdkService: SdkService,
    private readonly iframeService: IframeService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public async initSdk(): Promise<void> {
    this.subscribeOnAddressChange();
    await this.sdkService.initSDK(
      new URLSearchParams(this.window.location.search).get('feeTarget') ||
        new URLSearchParams(this.window.location.search).get('providerAddress')
    );
    this.loadUser();
  }

  private async loadUser(): Promise<void> {
    const { isIframe } = this.iframeService;
    if (!isIframe) {
      await this.authService.loadStorageUser();
    }
  }

  private subscribeOnAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        filter(Boolean),
        tap(address => {
          const chainType = this.walletConnectorService.chainType as keyof WalletProvider;
          const provider = this.walletConnectorService.provider;
          const walletProviderCore: WalletProviderCore = {
            address,
            core: chainType === CHAIN_TYPE.EVM ? provider.wallet : provider.wallet.tronWeb
          };
          this.sdkService.updateWallet(chainType, walletProviderCore);
        })
      )
      .subscribe();
  }
}
