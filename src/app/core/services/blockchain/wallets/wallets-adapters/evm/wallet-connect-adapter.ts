import { BehaviorSubject } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import Web3 from 'web3';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { WalletConnectAbstractAdapter } from '@core/services/blockchain/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { NgZone } from '@angular/core';

export class WalletConnectAdapter extends WalletConnectAbstractAdapter {
  public get walletName(): WALLET_NAME {
    return WALLET_NAME.WALLET_CONNECT;
  }

  /**
   * Gets detailed provider name with peer meta information.
   */
  public get detailedWalletName(): string {
    return `${this.name} (${this.wallet.connector.peerMeta.name})`;
  }

  constructor(
    web3: Web3,
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    zone: NgZone,
    availableMobileWallets?: string[]
  ) {
    const providerConfig = {
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      qrcodeModalOptions: {
        mobileLinks: availableMobileWallets
      }
    };
    super(web3, onNetworkChanges$, onAddressChanges$, errorsService, providerConfig, zone);
  }
}
