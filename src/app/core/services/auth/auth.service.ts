import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { finalize, first, mergeMap, switchMap } from 'rxjs/operators';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { SignRejectError } from 'src/app/core/errors/models/provider/SignRejectError';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { HeaderStore } from '../../header/services/header.store';
import { HttpService } from '../http/http.service';
import { WalletLoginInterface, UserInterface } from './models/user.interface';
import { ProviderConnectorService } from '../blockchain/provider-connector/provider-connector.service';
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
  private readonly $currentUser: BehaviorSubject<UserInterface>;

  private readonly USER_IS_IN_SESSION_CODE = '1000';

  get user(): UserInterface {
    return this.$currentUser.getValue();
  }

  get userAddress(): string {
    return this.user?.address;
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly store: StoreService,
    private readonly errorService: ErrorsService,
    private readonly iframeService: IframeService
  ) {
    this.isAuthProcess = false;
    this.$currentUser = new BehaviorSubject<UserInterface>(undefined);
    this.providerConnectorService.$addressChange.subscribe(address => {
      if (this.isAuthProcess) {
        return;
      }
      const user = this.$currentUser.getValue();
      if (
        user !== undefined &&
        user !== null &&
        user?.address !== null &&
        address &&
        user?.address !== address
      ) {
        this.signOut()
          .pipe(mergeMap(() => this.signIn()))
          .subscribe();
      }
    });
  }

  /**
   * @description Ger current user as observable.
   * @returns User.
   */
  public getCurrentUser(): Observable<UserInterface> {
    return this.$currentUser.asObservable();
  }

  /**
   * @description Fetch authorized user address or auth message in case there's no authorized user.
   */
  private fetchWalletLoginBody(): Observable<WalletLoginInterface> {
    return this.httpService.get('auth/wallets/login/', {});
  }

  /**
   * @description Authenticate user on backend.
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
        walletProvider
      })
      .pipe(switchMap(() => EMPTY))
      .toPromise();
  }

  public async loadUser() {
    this.isAuthProcess = true;
    if (!this.providerConnectorService.provider) {
      try {
        const success = await this.providerConnectorService.installProvider();
        if (!success) {
          this.$currentUser.next(null);
          this.isAuthProcess = false;
          return;
        }
      } catch (error) {
        error.displayError = false;
        throw error;
      }
    }
    this.fetchWalletLoginBody().subscribe(
      async walletLoginBody => {
        if (walletLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
          await this.providerConnectorService.activate();

          const { address } = walletLoginBody.payload.user;
          if (address.toLowerCase() === this.providerConnectorService.address.toLowerCase()) {
            this.$currentUser.next({ address });
          } else {
            this.signOut()
              .pipe(
                first(),
                finalize(() => {
                  this.signIn();
                })
              )
              .subscribe();
          }
        } else {
          this.$currentUser.next(null);
        }
        this.isAuthProcess = false;
      },
      () => this.$currentUser.next(null)
    );
  }

  /**
   * @description Initiate authentication via wallet message signing
   */
  public async signIn(): Promise<void> {
    try {
      if (this.iframeService.isIframe) {
        await this.serverlessSignIn();
        return;
      }

      this.isAuthProcess = true;
      await this.providerConnectorService.activate();

      const walletLoginBody = await this.fetchWalletLoginBody().toPromise();
      if (walletLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
        const { address } = walletLoginBody.payload.user;
        this.$currentUser.next({ address });
        this.isAuthProcess = false;
        return;
      }
      const nonce = walletLoginBody.payload.message;
      const signature = await this.providerConnectorService.signPersonal(nonce);
      await this.sendSignedNonce(
        this.providerConnectorService.address,
        nonce,
        signature,
        this.providerConnectorService.provider.name
      );

      this.$currentUser.next({ address: this.providerConnectorService.address });
      this.isAuthProcess = false;
    } catch (err) {
      this.catchSignIn(err);
    }
  }

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
        this.$currentUser.next({ address } || null);
      } else {
        this.$currentUser.next(null);
      }
      this.isAuthProcess = false;
    } catch (err) {
      this.catchSignIn(err);
    }
  }

  /**
   * @description Logout request to backend.
   */
  public signOut(): Observable<string> {
    if (this.iframeService.isIframe) {
      this.serverlessSignOut();
      return of('');
    }

    return this.httpService.post<string>('auth/wallets/logout/', {}).pipe(
      finalize(() => {
        this.providerConnectorService.deActivate();
        this.$currentUser.next(null);
        this.store.clearStorage();
      })
    );
  }

  public serverlessSignOut(): void {
    this.providerConnectorService.deActivate();
    this.$currentUser.next(null);
    this.store.clearStorage();
  }

  private catchSignIn(err) {
    this.$currentUser.next(null);
    this.isAuthProcess = false;
    this.providerConnectorService.deActivate();

    let error = err;
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
    this.errorService.catch(error);
    this.$currentUser.next(null);
    this.isAuthProcess = false;
  }
}
