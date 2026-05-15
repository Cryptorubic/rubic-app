import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { NgZone } from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WALLET_CONNECT_SUPPORTED_CHAINS } from '../../constants/evm-chain-ids';

export class WalletConnectAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.WALLET_CONNECT;

  /**
   * Gets detailed provider name with peer meta information.
   */
  public get detailedWalletName(): string {
    return `${this.walletName} WalletCONNECT`;
  }

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(
      {
        projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
        chains: [1],
        optionalChains: WALLET_CONNECT_SUPPORTED_CHAINS,
        showQrModal: true,
        qrModalOptions: {
          explorerRecommendedWalletIds: []
        }
      },
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window
    );
  }
}
