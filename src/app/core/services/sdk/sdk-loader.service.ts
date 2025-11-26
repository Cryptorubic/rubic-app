import { Inject, Injectable } from '@angular/core';
import { SdkService } from '@core/services/sdk/sdk.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletProvider, WalletProviderCore } from '@cryptorubic/web3';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WINDOW } from '@ng-web-apis/common';
import { createWalletClient, custom } from 'viem';
import { CHAIN_TYPE } from '@cryptorubic/core';

@Injectable()
export class SdkLoaderService {
  constructor(
    private readonly sdkService: SdkService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public async initSdk(): Promise<void> {
    await this.sdkService.initSDK();
    await this.authService.loadStorageUser();
  }

  public onAddressChange(address: string): void {
    const chainType = this.walletConnectorService.chainType as keyof WalletProvider;
    const provider = this.walletConnectorService.provider;
    if (!chainType) return;

    const chainTypeMap = {
      [CHAIN_TYPE.TRON]: provider.wallet?.tronWeb,
      [CHAIN_TYPE.EVM]:
        'request' in provider.wallet
          ? createWalletClient({ transport: custom(provider.wallet) })
          : null,
      [CHAIN_TYPE.SOLANA]: provider.wallet,
      [CHAIN_TYPE.TON]: provider.wallet,
      [CHAIN_TYPE.BITCOIN]: provider.wallet,
      [CHAIN_TYPE.SUI]: provider.wallet
    } as const;
    const core = chainTypeMap?.[chainType as keyof typeof chainTypeMap];
    const walletProviderCore: WalletProviderCore = { address, core };
    this.sdkService.updateWallet(this.walletConnectorService.network, walletProviderCore);
  }
}
