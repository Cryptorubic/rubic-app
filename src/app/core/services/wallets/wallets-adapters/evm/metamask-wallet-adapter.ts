import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { CoinbaseExtensionError } from '@core/errors/models/provider/coinbase-extension-error';
import { MetamaskError } from '@core/errors/models/provider/metamask-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

export class MetamaskWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.METAMASK;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  /**
   * Checks possible metamask errors.
   */
  private checkErrors(): void {
    if (!this.wallet?.isMetaMask) {
      throw new MetamaskError();
    }

    // installed coinbase Chrome extension
    if (this.wallet.hasOwnProperty('overrideIsMetaMask')) {
      throw new CoinbaseExtensionError();
    }
  }

  public async activate(): Promise<void> {
    try {
      const accounts = (await this.window.ethereum?.request({
        method: 'eth_requestAccounts'
      })) as RubicAny;

      this.wallet = this.window.ethereum;
      this.checkErrors();

      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chain) as EvmBlockchainName) ?? null;
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
      throw new MetamaskError();
    }
  }
}
