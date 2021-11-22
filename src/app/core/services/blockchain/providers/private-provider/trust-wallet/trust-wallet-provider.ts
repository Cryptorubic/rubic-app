import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import Web3 from 'web3';
import WalletConnect from '@walletconnect/web3-provider';
import networks from 'src/app/shared/constants/blockchain/networks';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectAbstractProvider } from '@core/services/blockchain/providers/common/wallet-connect-abstract';
import { RubicWindow } from '@shared/utils/rubic-window';

export class TrustWalletProvider extends WalletConnectAbstractProvider {
  constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<IBlockchain>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    window: RubicWindow
  ) {
    const rpcParams: Record<typeof networks[number]['id'], string> = networks
      .filter(network => isFinite(network.id))
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur.id]: cur.rpcLink
        };
      }, {});
    const core = new WalletConnect({
      rpc: rpcParams,
      bridge: 'https://bridge.walletconnect.org',
      qrcode: false
    });
    super(web3, chainChange$, accountChange$, errorsService, core);
    this.initDisplaySubscription(window);
  }

  /**
   * Subscribes to wallet connect deep link url and redirect after getting.
   * @param window Window object to redirect.
   */
  private initDisplaySubscription(window: RubicWindow): void {
    this.core.connector.on('display_uri', (err, payload) => {
      if (err) {
        console.debug(err);
        return;
      }
      const uri = payload.params[0];
      window.location.assign(`https://link.trustwallet.com/${uri}`);
    });
  }
}
