import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { MetamaskError } from '@core/errors/models/provider/metamask-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { RubicError } from '@core/errors/models/rubic-error';
import { NeedDisableCtrlWalletError } from '@app/core/errors/models/provider/ctrl-wallet-enabled-error';

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
    if (this.window.xfi?.ethereum?.isCtrl || this.window.xfi?.ethereum?.isXDEFI) {
      throw new NeedDisableCtrlWalletError(this.walletName.toUpperCase());
    }

    if (!this.wallet?.isMetaMask) {
      throw new MetamaskError();
    }

    if (typeof this.window?.tokenpocket?.ethereum?.isTokenPocket !== 'undefined') {
      throw new RubicError(
        'To proceed with using MetaMask wallet on our app, please disable all other wallets and reload the page.'
      );
    }
  }

  public async activate(): Promise<void> {
    try {
      const commonProvider = this.window?.ethereum;

      if (!commonProvider) {
        throw new MetamaskError();
      }

      if (commonProvider.providers?.length) {
        const metamaskProvider = commonProvider.providers.find(provider => provider?.isMetaMask);

        if (!metamaskProvider) {
          throw new MetamaskError();
        }

        this.wallet = metamaskProvider;
      } else {
        this.wallet = commonProvider;
      }

      const accounts = (await this.wallet.request({
        method: 'eth_requestAccounts'
      })) as RubicAny;
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

      if (error instanceof RubicError) {
        throw error;
      }

      throw new MetamaskError();
    }
  }
}
