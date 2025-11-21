import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { blockchainId, BlockchainName } from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';

export class BestwalletWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.BEST_WALLET;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    chainId?: number
  ) {
    super(
      {
        projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
        chains: [chainId || 1],
        optionalChains: Object.values(blockchainId),
        showQrModal: true,
        qrModalOptions: {
          explorerExcludedWalletIds: 'ALL',
          explorerRecommendedWalletIds: [
            '3Acd50380c2f3f8d044294dfaa2097249c8ed1d124c9a842102444e8b8c5a6a9db'
          ]
        }
      } as EthereumProviderOptions,
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window
    );
  }
}
