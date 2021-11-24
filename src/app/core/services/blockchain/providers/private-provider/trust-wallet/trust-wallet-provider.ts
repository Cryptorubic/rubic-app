import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import Web3 from 'web3';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectAbstractProvider } from '@core/services/blockchain/providers/common/wallet-connect-abstract';
import { RubicWindow } from '@shared/utils/rubic-window';
import { IWalletConnectProviderOptions } from '@walletconnect/types';

export class TrustWalletProvider extends WalletConnectAbstractProvider {
  constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<IBlockchain>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    isIos: boolean,
    window: RubicWindow
  ) {
    const providerConfig: IWalletConnectProviderOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcode: false
    };
    super(web3, chainChange$, accountChange$, errorsService, providerConfig);
    this.initDisplaySubscription(window, isIos);
  }

  /**
   * Subscribes to wallet connect deep link url and redirects after getting.
   * @param window Window object to redirect.
   * @param isIos Is current device has mobile Apple OS.
   */
  private initDisplaySubscription(window: RubicWindow, isIos: boolean): void {
    this.core.connector.on('display_uri', (err, payload) => {
      if (err) {
        console.debug(err);
        return;
      }
      TrustWalletProvider.redirectToWallet(window, isIos, payload.params[0]);
    });
  }

  /**
   * Redirects to trust wallet mobile app via deep linking.
   * @param window Global window object.
   * @param isIos Is current device has mobile Apple OS.
   * @param uri Deeplink uri query param.
   */
  private static redirectToWallet(window: RubicWindow, isIos: boolean, uri: string): void {
    const encodedUri = encodeURIComponent(uri);
    const decodedUri = decodeURIComponent(uri);
    const deepLink = isIos ? `https://link.trustwallet.com/wc?uri=${encodedUri}` : decodedUri;

    window.location.assign(deepLink);
  }
}
