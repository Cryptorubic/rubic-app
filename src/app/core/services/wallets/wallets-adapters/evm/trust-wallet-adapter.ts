import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';
import { WALLET_CONNECT_SUPPORTED_CHAINS } from '../../constants/evm-chain-ids';

export class TrustWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.TRUST_WALLET;

  constructor(
    accountChange$: BehaviorSubject<string>,
    chainChange$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    private readonly isIos: boolean
  ) {
    super(
      {
        projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
        showQrModal: false,
        chains: [1],
        optionalChains: WALLET_CONNECT_SUPPORTED_CHAINS
      },
      accountChange$,
      chainChange$,
      errorsService,
      zone,
      window
    );

    this.initDisplaySubscription();
  }

  /**
   * Subscribes to wallet connect deep link url and redirects after getting.
   */
  private initDisplaySubscription(): void {
    //@ts-ignore
    this.wallet.on('display_uri', (err: unknown, payload: { params: string[] }) => {
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
