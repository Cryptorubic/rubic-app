import { Inject, Injectable } from '@angular/core';
import { SdkService } from '@core/services/sdk/sdk.service';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, tap } from 'rxjs/operators';
import { CHAIN_TYPE, WalletProviderCore } from '@cryptorubic/sdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WINDOW } from '@ng-web-apis/common';
import { referralToIntegratorAddressMapping } from '@core/services/sdk/constants/provider-addresses';
import { createWalletClient, custom } from 'viem';
import { WalletProvider } from '@cryptorubic/web3';

@Injectable()
export class SdkLoaderService {
  constructor(
    private readonly sdkService: SdkService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public async initSdk(): Promise<void> {
    this.subscribeOnAddressChange();

    await this.sdkService.initSDK(this.getProviderAddresses());
    await this.loadUser();
  }

  private getProviderAddresses(): {
    crossChainIntegratorAddress: string;
    onChainIntegratorAddress: string;
  } {
    const urlParams = new URLSearchParams(this.window.location.search);
    const commonIntegrator = urlParams.get('feeTarget') || urlParams.get('providerAddress');
    const crossChainProvider = urlParams.get('crossChainIntegratorAddress') || commonIntegrator;
    const onChainProvider = urlParams.get('onChainIntegratorAddress') || commonIntegrator;
    const referral = urlParams.get('referral');
    const onChainProviderAddress = referralToIntegratorAddressMapping[referral?.toLowerCase()];

    return {
      crossChainIntegratorAddress: crossChainProvider,
      onChainIntegratorAddress: onChainProvider || onChainProviderAddress
    };
  }

  private async loadUser(): Promise<void> {
    await this.authService.loadStorageUser();
  }

  private subscribeOnAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        filter(Boolean),
        tap(address => {
          const chainType = this.walletConnectorService.chainType as keyof WalletProvider;
          const provider = this.walletConnectorService.provider;
          const chainTypeMap = {
            [CHAIN_TYPE.EVM]: createWalletClient({ transport: custom(provider.wallet) }),
            [CHAIN_TYPE.TRON]: provider.wallet.tronWeb,
            [CHAIN_TYPE.SOLANA]: provider.wallet,
            [CHAIN_TYPE.TON]: provider.wallet,
            [CHAIN_TYPE.BITCOIN]: provider.wallet,
            [CHAIN_TYPE.SUI]: provider.wallet
          } as const;
          const core = chainTypeMap?.[chainType as keyof typeof chainTypeMap];
          const walletProviderCore: WalletProviderCore = { address, core };
          this.sdkService.updateWallet(chainType, walletProviderCore);
        })
      )
      .subscribe();
  }
}
