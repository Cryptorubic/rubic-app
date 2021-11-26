import { BehaviorSubject, Observable } from 'rxjs';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import Web3 from 'web3';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectAbstractProvider } from '@core/services/blockchain/providers/common/wallet-connect-abstract';
import { RubicWindow } from '@shared/utils/rubic-window';
import { IWalletConnectProviderOptions } from '@walletconnect/types';

export class TrustWalletProvider extends WalletConnectAbstractProvider {
  private deepLink: string;

  private readonly window: RubicWindow;

  private readonly isIos: boolean;

  constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<IBlockchain>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    isIos: boolean,
    window: RubicWindow,
    transactionEmitter$: Observable<void>
  ) {
    const providerConfig: IWalletConnectProviderOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcode: false
    };
    super(web3, chainChange$, accountChange$, errorsService, providerConfig);
    this.window = window;
    this.isIos = isIos;
    this.initDisplaySubscription();
    transactionEmitter$.subscribe(() => {
      this.redirectToWallet();
    });
  }

  /**
   * Subscribes to wallet connect deep link url and redirects after getting.
   */
  private initDisplaySubscription(): void {
    this.core.connector.on('display_uri', (err, payload) => {
      if (err) {
        console.debug(err);
        return;
      }
      const uri = payload.params[0];
      const encodedUri = encodeURIComponent(uri);
      const decodedUri = decodeURIComponent(uri);
      this.deepLink = this.isIos ? `wc?uri=${encodedUri}` : decodedUri;
      this.redirectToWallet();
    });
  }

  /**
   * Redirects to trust wallet mobile app via deep linking.
   */
  private redirectToWallet(): void {
    if (this.isIos) {
      try {
        this.window.location.assign(`trust://${this.deepLink}`);
      } catch (err) {
        this.window.location.assign(`https://link.trustwallet.com/${this.deepLink}`);
      }
    } else {
      this.window.location.assign(this.deepLink);
    }
  }
}
