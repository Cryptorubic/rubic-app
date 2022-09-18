import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '../../header/services/header.store';
import { HttpService } from '../http/http.service';
import { UserInterface } from './models/user.interface';
import { StoreService } from '../store/store.service';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { CookieService } from 'ngx-cookie-service';
import { BrowserService } from '../browser/browser.service';
import { BROWSER } from '@app/shared/models/browser/browser';
import { compareAddresses } from '@shared/utils/utils';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { CHAIN_TYPE } from 'rubic-sdk';

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Is auth process going in.
   */
  private isAuthProcess: boolean;

  /**
   * Current user data.
   */
  private readonly currentUser$: BehaviorSubject<UserInterface>;

  get user(): UserInterface {
    return this.currentUser$.getValue();
  }

  get userAddress(): string {
    return this.user?.address;
  }

  get userChainType(): string {
    return this.user?.chainType;
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly store: StoreService,
    private readonly errorService: ErrorsService,
    private readonly cookieService: CookieService,
    @Inject(WINDOW) private window: RubicWindow,
    private readonly gtmService: GoogleTagManagerService,
    private readonly browserService: BrowserService
  ) {
    this.isAuthProcess = false;
    this.currentUser$ = new BehaviorSubject<UserInterface>(undefined);
  }

  /**
   * Ger current user as observable.
   * @return Observable<UserInterface> User.
   */
  public getCurrentUser(): Observable<UserInterface> {
    return this.currentUser$.asObservable();
  }

  /**
   * Check if user already connected wallet.
   */
  public async loadUser(): Promise<void> {
    this.isAuthProcess = true;
    if (!this.walletConnectorService.provider) {
      try {
        const success = await this.walletConnectorService.installProvider();
        if (!success) {
          this.currentUser$.next(null);
          this.isAuthProcess = false;
          return;
        }
      } catch (error) {
        error.displayError = false;
        throw error;
      }
    }

    const cookieAddress = this.cookieService.get('address');
    const address = cookieAddress === 'null' ? null : cookieAddress;

    if (address) {
      this.activateProviderAndSignIn(address).subscribe();
    } else {
      this.currentUser$.next(null);
      this.isAuthProcess = false;
    }
  }

  public setCurrentUser(address: string, chainType: CHAIN_TYPE): void {
    if (compareAddresses(address, this.userAddress)) {
      return;
    }

    this.cookieService.set('address', address, 7, null, null, null, null);
    this.currentUser$.next({ address, chainType });
  }

  private activateProviderAndSignIn(address: string): Observable<void> {
    return from(this.walletConnectorService.activate()).pipe(
      switchMap(() => {
        if (compareAddresses(address, this.walletConnectorService.address)) {
          this.currentUser$.next({
            address: this.walletConnectorService.address,
            chainType: this.walletConnectorService.chainType
          });
          return of() as Observable<void>;
        }
        return this.serverlessSignIn();
      })
    );
  }

  /**
   * Connect wallet.
   */
  public async serverlessSignIn(provider?: WALLET_NAME): Promise<void> {
    const isMetamaskBrowser = this.browserService.currentBrowser === BROWSER.METAMASK;
    try {
      this.isAuthProcess = true;
      let permissions: boolean;
      if (!isMetamaskBrowser) {
        const walletPermissions = await this.walletConnectorService.requestPermissions();
        permissions = walletPermissions.some(
          permission => permission.parentCapability === 'eth_accounts'
        );
      } else {
        permissions = true;
      }

      if (permissions) {
        await this.walletConnectorService.activate();
        const { address, chainType } = this.walletConnectorService;
        this.currentUser$.next({ address, chainType } || null);
        this.cookieService.set('address', address, 7, null, null, null, null);

        if (provider) {
          this.gtmService.fireConnectWalletEvent(provider);
        }
      } else {
        this.currentUser$.next(null);
      }

      this.isAuthProcess = false;
    } catch (err) {
      this.catchSignIn(err);
    }
  }

  /**
   * Disconnect wallet.
   */
  public serverlessSignOut(): void {
    this.walletConnectorService.deActivate();
    this.currentUser$.next(null);
    this.store.clearStorage();
  }

  /**
   * Catch and handle user login errors.
   * @param err Login error.
   */
  private catchSignIn(err: Error & { code: number }): void {
    this.currentUser$.next(null);
    this.isAuthProcess = false;
    this.walletConnectorService.deActivate();

    let error: Error = err;
    if (
      err.code === 4001 ||
      // metamask browser
      err.message?.toLowerCase().includes('user denied message signature') ||
      // coinbase browser
      err.message?.toLowerCase().includes('sign message cancelled')
    ) {
      error = new SignRejectError();
    }
    this.headerStore.setWalletsLoadingStatus(false);
    this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
    this.currentUser$.next(null);
    this.isAuthProcess = false;
  }
}
