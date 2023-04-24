import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { getEthereumProvider } from '@argent/login';
import { rpcList } from '@shared/constants/blockchain/rpc-list';

export class ArgentWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.ARGENT;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    const providerConfig: IWalletConnectProviderOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcode: false
    };
    super(providerConfig, onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    try {
      this.wallet = await getEthereumProvider({
        chainId: 1,
        rpcUrl: rpcList[BLOCKCHAIN_NAME.ETHEREUM][0],
        walletConnect: {
          metadata: {
            name: 'Rubic exchange',
            description: 'Rubic Cross-Chain Tech Aggregator',
            url: 'https://app.rubic.exchange',
            icons: [`${this.window.location.origin}/assets/images/rbc.png`]
          }
        }
      });
      await super.activate();
    } catch (error) {
      throw new WalletlinkError();
    }
  }
}
