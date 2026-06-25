import { WA_WINDOW } from '@ng-web-apis/common';
import { Inject, Injectable } from '@angular/core';
import { SdkService } from '@core/services/sdk/sdk.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletProvider, WalletProviderCore } from '@cryptorubic/web3';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { createWalletClient, custom } from 'viem';
import { CHAIN_TYPE } from '@cryptorubic/core';
import { toRippleWalletCore } from '@core/services/wallets/wallets-adapters/xrpl/utils/to-ripple-wallet-core';
import { XamanSignService } from '@core/services/wallets/wallets-adapters/xrpl/services/xaman-sign.service';
import { Xumm } from 'xumm';

@Injectable()
export class SdkLoaderService {
  constructor(
    private readonly sdkService: SdkService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly xamanSignService: XamanSignService,
    @Inject(WA_WINDOW) private readonly window: Window
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
      [CHAIN_TYPE.SUI]: provider.wallet,
      [CHAIN_TYPE.STELLAR]: provider.wallet,
      [CHAIN_TYPE.RIPPLE]: toRippleWalletCore(provider.wallet as Xumm, this.xamanSignService)
    } as const;
    const core = chainTypeMap?.[chainType as keyof typeof chainTypeMap];
    const walletProviderCore: WalletProviderCore = { address, core };
    this.sdkService.updateWallet(this.walletConnectorService.network, walletProviderCore);
  }
}
