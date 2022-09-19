import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { CoinbaseExtensionError } from '@core/errors/models/provider/coinbase-extension-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { RubicWindow } from '@shared/utils/rubic-window';
import { BitKeepError } from '@core/errors/models/provider/bitkeep-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';

export class BitkeepWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.BITKEEP;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone);

    this.wallet = window.bitkeep?.ethereum;
    this.checkErrors();
  }

  /**
   * Checks possible BitKeep errors.
   */
  private checkErrors(): void {
    if (!this.wallet?.isBitKeep) {
      throw new BitKeepError();
    }

    // installed coinbase Chrome extension
    if (this.wallet.hasOwnProperty('overrideIsMetaMask')) {
      throw new CoinbaseExtensionError();
    }
  }

  public async activate(): Promise<void> {
    try {
      const accounts = await this.wallet.request({
        method: 'eth_requestAccounts'
      });
      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain = BlockchainsInfo.getBlockchainNameById(chain) ?? null;
      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);

      this.initSubscriptionsOnChanges();
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature') ||
        // Bitkeep
        error.message?.toLowerCase().includes('user rejected the request')
      ) {
        throw new SignRejectError();
      }
    }
  }
}
