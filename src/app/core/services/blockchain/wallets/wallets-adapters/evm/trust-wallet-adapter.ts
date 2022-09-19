import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletConnectAbstractAdapter } from '@core/services/blockchain/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { RubicWindow } from '@shared/utils/rubic-window';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';

export class TrustWalletAdapter extends WalletConnectAbstractAdapter {
  public get walletName(): WALLET_NAME {
    return WALLET_NAME.TRUST_WALLET;
  }

  constructor(
    accountChange$: BehaviorSubject<string>,
    chainChange$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    private readonly isIos: boolean,
    private readonly window: RubicWindow
  ) {
    const providerConfig: IWalletConnectProviderOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcode: false
    };
    super(providerConfig, accountChange$, chainChange$, errorsService, zone);

    this.initDisplaySubscription();
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
      const deepLink = this.isIos ? `wc?uri=${encodedUri}` : decodedUri;
      this.redirectToWallet(deepLink);
    });
  }

  /**
   * Redirects to trust wallet mobile app via deep linking.
   */
  private redirectToWallet(deepLink: string): void {
    if (this.isIos) {
      try {
        this.window.location.assign(`trust://${deepLink}`);
      } catch (err) {
        this.window.location.assign(`https://link.trustwallet.com/${deepLink}`);
      }
    } else {
      this.window.location.assign(deepLink);
    }
  }
}
