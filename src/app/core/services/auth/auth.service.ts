import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, from, Observable, of } from 'rxjs';
import { catchError, filter, finalize, first, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { SignRejectError } from 'src/app/core/errors/models/provider/SignRejectError';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { switchIif } from '@shared/utils/utils';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '../../header/services/header.store';
import { HttpService } from '../http/http.service';
import { WalletLoginInterface, UserInterface } from './models/user.interface';
import { StoreService } from '../store/store.service';

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

  /**
   * Code when user session is still active.
   */
  private readonly USER_IS_IN_SESSION_CODE = '1000';

  get user(): UserInterface {
    return this.currentUser$.getValue();
  }

  get userAddress(): string {
    return this.user?.address;
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService,
    private readonly providerConnectorService: WalletConnectorService,
    private readonly store: StoreService,
    private readonly errorService: ErrorsService,
    private readonly iframeService: IframeService
  ) {
    this.isAuthProcess = false;
    this.currentUser$ = new BehaviorSubject<UserInterface>(undefined);
    this.initSubscription();
  }

  /**
   * Ger current user as observable.
   * @return Observable<UserInterface> User.
   */
  public getCurrentUser(): Observable<UserInterface> {
    return this.currentUser$.asObservable();
  }

  /**
   * Fetch authorized user address or auth message in case there's no authorized user.
   */
  private fetchWalletLoginBody(): Observable<WalletLoginInterface> {
    return this.httpService.get<WalletLoginInterface>('auth/wallets/login/', {});
  }

  /**
   * Authenticate user on backend.
   * @param address wallet address
   * @param nonce nonce to sign
   * @param signature signed nonce
   * @param walletProvider wallet provider
   * @return Authentication key.
   */
  private sendSignedNonce(
    address: string,
    nonce: string,
    signature: string,
    walletProvider: WALLET_NAME
  ): Promise<void> {
    return this.httpService
      .post('auth/wallets/login/', {
        address,
        message: nonce,
        signedMessage: signature,
        walletProvider,
        type: this.providerConnectorService.provider.walletType.toLowerCase()
      })
      .pipe(switchMap(() => EMPTY))
      .toPromise();
  }

  /**
   * Load user from backend.
   */
  public async loadUser(): Promise<void> {
    this.isAuthProcess = true;
    if (!this.providerConnectorService.provider) {
      try {
        const success = await this.providerConnectorService.installProvider();
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
    await this.fetchWalletLoginBody()
      .pipe(
        switchIif(
          walletLoginBody => walletLoginBody.code === this.USER_IS_IN_SESSION_CODE,
          walletLoginBody => this.activateProviderAndSignIn(walletLoginBody),
          () => this.setNullAsUser()
        ),
        tap(() => (this.isAuthProcess = false)),
        catchError((err: unknown) => {
          console.error(err);
          return this.setNullAsUser();
        })
      )
      .toPromise();
  }

  private activateProviderAndSignIn(walletLoginBody: WalletLoginInterface): Observable<void> {
    const { address } = walletLoginBody.payload.user;
    return from(this.providerConnectorService.activate()).pipe(
      switchMap(() => {
        if (address.toLowerCase() === this.providerConnectorService.address.toLowerCase()) {
          this.currentUser$.next({ address: this.providerConnectorService.address });
          return of() as Observable<void>;
        }
        return this.signOut().pipe(
          first(),
          switchMap(() => this.signIn())
        );
      })
    );
  }

  private setNullAsUser(): Observable<void> {
    this.currentUser$.next(null);
    return of();
  }

  /**
   * Initiate authentication via wallet message signing
   */
  public async signIn(): Promise<void> {
    try {
      if (this.iframeService.isIframe) {
        await this.iframeSignIn();
        return;
      }

      this.isAuthProcess = true;
      await this.providerConnectorService.activate();

      const walletLoginBody = await this.fetchWalletLoginBody().toPromise();
      if (walletLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
        this.currentUser$.next({ address: this.providerConnectorService.provider.address });
        this.isAuthProcess = false;
        return;
      }
      const { message } = walletLoginBody.payload;
      const signature = await this.providerConnectorService.signPersonal(message);
      await this.sendSignedNonce(
        this.providerConnectorService.address,
        message,
        signature,
        this.providerConnectorService.provider.walletName
      );

      this.currentUser$.next({ address: this.providerConnectorService.address });
      this.isAuthProcess = false;
    } catch (err) {
      this.catchSignIn(err);
    }
  }

  /**
   * Initiate iframe authentication via wallet message signing
   */
  public async iframeSignIn(): Promise<void> {
    try {
      this.isAuthProcess = true;
      const permissions = await this.providerConnectorService.requestPermissions();
      const accountsPermission = permissions.find(
        permission => permission.parentCapability === 'eth_accounts'
      );

      if (accountsPermission) {
        await this.providerConnectorService.activate();

        const walletLoginBody = await this.fetchWalletLoginBody().toPromise();
        if (walletLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
          this.currentUser$.next({ address: this.providerConnectorService.provider.address });
          this.isAuthProcess = false;
          return;
        }
        const { message } = walletLoginBody.payload;
        const signature = await this.providerConnectorService.signPersonal(message);
        await this.sendSignedNonce(
          this.providerConnectorService.address,
          message,
          signature,
          this.providerConnectorService.provider.walletName
        );

        this.currentUser$.next({ address: this.providerConnectorService.address });
      } else {
        this.currentUser$.next(null);
      }
      this.isAuthProcess = false;
    } catch (err) {
      this.catchSignIn(err);
    }
  }

  /**
   * Login user without backend request.
   */
  public async serverlessSignIn(): Promise<void> {
    try {
      this.isAuthProcess = true;
      const permissions = await this.providerConnectorService.requestPermissions();
      const accountsPermission = permissions.find(
        permission => permission.parentCapability === 'eth_accounts'
      );
      if (accountsPermission) {
        await this.providerConnectorService.activate();
        const { address } = this.providerConnectorService;
        this.currentUser$.next({ address } || null);
      } else {
        this.currentUser$.next(null);
      }
      this.isAuthProcess = false;
    } catch (err) {
      this.catchSignIn(err);
    }
  }

  /**
   * Logout request to backend.
   */
  public signOut(): Observable<string> {
    return this.httpService.post<string>('auth/wallets/logout/', {}).pipe(
      finalize(() => {
        this.providerConnectorService.deActivate();
        this.currentUser$.next(null);
        this.store.clearStorage();
      })
    );
  }

  /**
   * Logout user from provider and application.
   */
  public serverlessSignOut(): void {
    this.providerConnectorService.deActivate();
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
    this.providerConnectorService.deActivate();

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

  /**
   * Init service subscription.
   */
  private initSubscription(): void {
    this.providerConnectorService.addressChange$
      .pipe(
        filter(() => !this.isAuthProcess),
        mergeMap(address => {
          const user = this.currentUser$.getValue();
          if (
            user !== undefined &&
            user !== null &&
            user?.address !== null &&
            address &&
            user?.address !== address
          ) {
            return this.signOut().pipe(mergeMap(() => this.signIn()));
          }
          return of();
        })
      )
      .subscribe();
  }
}
