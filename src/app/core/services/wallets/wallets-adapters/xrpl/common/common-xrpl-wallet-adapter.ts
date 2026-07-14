import { BehaviorSubject } from 'rxjs';
import { CommonWalletAdapter } from '../../common-wallet-adapter';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { XamanWallet } from '../models/xaman-wallet';
import { XamanInstance } from '../utils/xaman-instance';
import { SignRejectError } from '@app/core/errors/models/provider/sign-reject-error';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { UniversalSdkEvent } from 'xumm';

const XRPL_MAINNET_NETWORK_TYPE = 'MAINNET';

export abstract class CommonXrplWalletAdapter extends CommonWalletAdapter<XamanWallet> {
  public chainType = CHAIN_TYPE.RIPPLE;

  private logoutListener: UniversalSdkEvent['logout'] | null = null;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    try {
      const xumm = await XamanInstance.waitUntilReady();
      this.subscribeToLogout(xumm);

      if (!xumm.state.signedIn) {
        const authorizeResult = await xumm.authorize();

        if (authorizeResult instanceof Error) {
          throw this.mapAuthorizeError(authorizeResult);
        }
      }

      const networkType = await xumm.user.networkType;

      if (networkType !== XRPL_MAINNET_NETWORK_TYPE) {
        throw new RubicError('Only XRP Ledger mainnet is supported.');
      }

      const address = await xumm.user.account;

      if (!address) {
        throw new RubicError('Failed to get Xaman wallet address.');
      }

      this.selectedChain = BLOCKCHAIN_NAME.RIPPLE;
      this.selectedAddress = address;
      this.isEnabled = true;
      this.wallet = xumm;

      this.onNetworkChanges$.next(this.selectedChain);
      this.onAddressChanges$.next(this.selectedAddress);
    } catch (err) {
      if (err instanceof SignRejectError || err instanceof RubicError) {
        throw err;
      }

      throw this.mapAuthorizeError(err);
    }
  }

  public deactivate(): void {
    const xumm = this.wallet ?? XamanInstance.getInstance();

    if (this.logoutListener) {
      xumm.off('logout', this.logoutListener);
      this.logoutListener = null;
    }

    void XamanInstance.logout();
    super.deactivate();
  }

  private subscribeToLogout(xumm: XamanWallet): void {
    if (this.logoutListener) {
      xumm.off('logout', this.logoutListener);
    }

    this.logoutListener = () => {
      this.zone.run(() => {
        if (this.logoutListener) {
          xumm.off('logout', this.logoutListener);
          this.logoutListener = null;
        }
        // SDK already ran logout(); ready promise is broken until next unblock.
        XamanInstance.markReadyNeedsUnblock();
        super.deactivate();
      });
    };

    xumm.on('logout', this.logoutListener);
  }

  private mapAuthorizeError(err: unknown): SignRejectError | RubicError<ERROR_TYPE.TEXT> {
    const message = err instanceof Error ? err.message?.toLowerCase() : String(err).toLowerCase();

    if (
      message.includes('user declined') ||
      message.includes('user rejected') ||
      message.includes('cancelled') ||
      message.includes('canceled') ||
      message.includes('denied')
    ) {
      return new SignRejectError();
    }

    if (err instanceof RubicError) {
      return err;
    }

    return new RubicError(err instanceof Error ? err.message : 'Failed to connect Xaman wallet.');
  }
}
