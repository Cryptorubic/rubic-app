import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { BlockchainName, blockchainId } from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';

/**
 * Handles MetaMask connection on mobile browsers via WalletConnect deep link.
 * The user stays in their browser (e.g. Chrome) and approves the connection
 * inside the MetaMask app, then returns to the browser with the wallet connected.
 */
export class MetamaskMobileWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.METAMASK;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    isIos: boolean,
    chainId?: number
  ) {
    super(
      {
        projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
        showQrModal: true,
        chains: [chainId | 1],
        optionalChains: Object.values(blockchainId)
      },
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window
    );
    this.initDisplaySubscription(isIos);
  }

  /**
   * Subscribes to wallet connect deep link url and redirects after getting.
   */
  private initDisplaySubscription(isIos: boolean): void {
    //@ts-ignore
    this.wallet.on('display_uri', (uri: string) => {
      const encodedUri = encodeURIComponent(uri);
      const deepLink = isIos
        ? `https://metamask.app.link/wc?uri=${encodedUri}`
        : `metamask://wc?uri=${encodedUri}`;
      this.window.location.href = deepLink;
    });
  }
}
