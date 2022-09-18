import { Injectable } from '@angular/core';
import { RubicSdkService } from '@app/features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { StoreService } from '@core/services/store/store.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletProvider } from 'rubic-sdk';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { CHAIN_TYPE } from 'rubic-sdk/lib/core/blockchain/models/chain-type';

@Injectable({
  providedIn: 'root'
})
export class SdkLoaderService {
  constructor(
    private readonly sdkService: RubicSdkService,
    private readonly iframeService: IframeService,
    private readonly storeService: StoreService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public async initSdk(): Promise<void> {
    await this.loadUser();
    await this.sdkService.initSDK();
    await this.updateSdkUser();
  }

  private async loadUser(): Promise<void> {
    const { isIframe } = this.iframeService;
    this.storeService.fetchData();
    if (!isIframe) {
      try {
        await this.authService.loadUser();
      } catch {}
    }
  }

  private async updateSdkUser(): Promise<void> {
    if (this.authService.user) {
      const walletProvider: WalletProvider = {
        [CHAIN_TYPE.EVM]: {
          address: this.authService.user.address,
          core: this.walletConnectorService.provider.wallet
        }
      };
      await this.sdkService.patchConfig({ walletProvider });
    }
  }
}
