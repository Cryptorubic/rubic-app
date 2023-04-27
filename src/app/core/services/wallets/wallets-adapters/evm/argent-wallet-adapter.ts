import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';

export class ArgentWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.ARGENT;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    const providerConfig = {
      bridge: 'https://bridge.walletconnect.org',
      qrCode: true,
      qrcodeModalOptions: {
        desktopLinks: ['argent'],
        mobileLinks: ['argent']
      }
    };
    super(providerConfig, onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    setTimeout(() => {
      try {
        const walletConnectorWrapper = this.window.document.querySelector('#walletconnect-wrapper');
        const header = walletConnectorWrapper.querySelector('.walletconnect-modal__header');

        const title = header.querySelector('p');
        title.innerHTML = 'Connect the Argent Wallet';

        const image = header.querySelector('img') as HTMLImageElement;
        image.src = `${this.window.origin}/assets/images/icons/wallets/argent.svg`;

        const description = walletConnectorWrapper.querySelector('#walletconnect-qrcode-text');
        description.innerHTML = 'Scan QR code with the Argent wallet';
      } catch {}
    }, 300);

    await super.activate();
  }
}
