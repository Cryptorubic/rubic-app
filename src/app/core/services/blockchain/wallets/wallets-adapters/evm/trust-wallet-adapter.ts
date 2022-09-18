import { BehaviorSubject, Observable } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import Web3 from 'web3';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletConnectAbstractAdapter } from '@core/services/blockchain/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { RubicWindow } from '@shared/utils/rubic-window';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';

export class TrustWalletAdapter extends WalletConnectAbstractAdapter {
  private deepLink: string;

  private readonly window: RubicWindow;

  private readonly isIos: boolean;

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.TRUST_WALLET;
  }

  constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<BlockchainData>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    isIos: boolean,
    window: RubicWindow,
    transactionEmitter$: Observable<void>,
    zone: NgZone
  ) {
    const providerConfig: IWalletConnectProviderOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcode: false
    };
    super(web3, chainChange$, accountChange$, errorsService, providerConfig, zone);
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
    this.wallet.connector.on('display_uri', (err: unknown, payload: { params: string[] }) => {
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
