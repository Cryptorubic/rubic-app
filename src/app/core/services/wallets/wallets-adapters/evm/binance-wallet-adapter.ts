import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { blockchainId, BlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';

export class BinanceWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.BINANCE_WALLET;

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
            '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4'
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
