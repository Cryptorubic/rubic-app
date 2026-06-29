import { WA_WINDOW } from '@ng-web-apis/common';
import { Inject, Injectable } from '@angular/core';
import { SdkService } from '@core/services/sdk/sdk.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletProviderCore } from '@cryptorubic/web3';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { createWalletClient, custom } from 'viem';
import { CHAIN_TYPE } from '@cryptorubic/core';
import { compareAddresses } from '@app/shared/utils/utils';

@Injectable()
export class SdkLoaderService {
  constructor(
    private readonly sdkService: SdkService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WA_WINDOW) private readonly window: Window
  ) {}

  public async initSdk(): Promise<void> {
    await this.sdkService.initSDK();
    await this.authService.loadStorageUser();
  }

  public onAddressChange(address: string): void {
    const activeWallets = this.walletConnectorService.activeWallets;
    const provider = activeWallets.find(wallet => compareAddresses(wallet.address, address));
    if (!provider) return;

    const chainType = provider.chainType;
    const blockchain = provider.network;

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
      [CHAIN_TYPE.STELLAR]: provider.wallet
    } as const;
    const core = chainTypeMap?.[chainType as keyof typeof chainTypeMap];
    const walletProviderCore: WalletProviderCore = { address, core };
    this.sdkService.updateWallet(blockchain, walletProviderCore);
  }
}
