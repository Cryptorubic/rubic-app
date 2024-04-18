import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import SafeAppsSDK from '@safe-global/safe-apps-sdk';

export class SafeWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.SAFE;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    try {
      const sdk = new SafeAppsSDK({
        allowedDomains: [
          /(http|https)(:\/\/)local.rubic.exchange(.*)$/,
          /(http|https)(:\/\/)blockscout.com(.*)$/,
          /(http|https)(:\/\/)app.safe.global(.*)$/,
          /.*/
        ],
        debug: true
      });
      const safe = await sdk.safe.getInfo();
      this.wallet = new SafeAppProvider(safe, sdk);

      const accounts = await this.wallet.request({
        method: 'eth_accounts'
      });
      const chain = await this.wallet.request({ method: 'eth_chainId' });

      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chain) as EvmBlockchainName) ?? null;
      console.info(this.selectedChain, this.selectedAddress);
      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);

      this.initSubscriptionsOnChanges();
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }
      throw new Error('Unknown wallet error');
    }
  }
}
