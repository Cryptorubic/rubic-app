import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, first, mergeMap } from 'rxjs/operators';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { SignRejectError } from 'src/app/core/errors/models/provider/SignRejectError';
import CustomError from 'src/app/core/errors/models/custom-error';
import { HeaderStore } from '../../header/services/header.store';
import { HttpService } from '../http/http.service';
import { MetamaskLoginInterface, UserInterface } from './models/user.interface';
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

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly store: StoreService,
    private readonly errorService: ErrorsService
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
  private fetchMetamaskLoginBody(): Observable<MetamaskLoginInterface> {
    return this.httpService.get('metamask/login/', {});
  }

  /**
   * @description Authenticate user on backend.
   * @param address wallet address
   * @param nonce nonce to sign
   * @param signature signed nonce
   * @return Authentication key.
   */
  private sendSignedNonce(address: string, nonce: string, signature: string): Promise<void> {
    return this.httpService
      .post('metamask/login/', { address, message: nonce, signed_message: signature })
      .toPromise();
  }

  public async loadUser() {
    this.isAuthProcess = true;
    if (!this.providerConnectorService.provider) {
      const error = new CustomError('Provider error');
      error.displayError = false;
      throw error;
    }
    this.fetchMetamaskLoginBody().subscribe(
      async metamaskLoginBody => {
        if (metamaskLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
          await this.providerConnectorService.activate();

          const { address } = metamaskLoginBody.payload.user;
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
   * @description Initiate authentication via metamask.
   */
  public async signIn(loginWithoutBackend: boolean = false): Promise<void> {
    try {
      if (loginWithoutBackend) {
        await this.serverlessSignIn();
        return;
      }

      this.isAuthProcess = true;
      await this.providerConnectorService.activate();

      const metamaskLoginBody = await this.fetchMetamaskLoginBody().toPromise();
      if (metamaskLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
        const { address } = metamaskLoginBody.payload.user;
        this.$currentUser.next({ address });
        this.isAuthProcess = false;
        return;
      }
      const nonce = metamaskLoginBody.payload.message;
      const signature = await this.providerConnectorService.signPersonal(nonce);
      await this.sendSignedNonce(this.providerConnectorService.address, nonce, signature);

      this.$currentUser.next({ address: this.providerConnectorService.address });
      this.isAuthProcess = false;
    } catch (err) {
      this.$currentUser.next(null);
      this.isAuthProcess = false;
      this.providerConnectorService.deActivate();

      let error = err;
      if (err.code === 4001) {
        error = new SignRejectError();
      }
      this.headerStore.setWalletsLoadingStatus(false);
      this.errorService.catch$(error);
      this.$currentUser.next(null);
      this.isAuthProcess = false;
    }
  }

  public async serverlessSignIn(): Promise<void> {
    this.isAuthProcess = true;
    await this.providerConnectorService.connectDefaultProvider();
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
  }

  /**
   * @description Logout request to backend.
   */
  public signOut(): Observable<string> {
    return this.httpService.post('metamask/logout/', {}).pipe(
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
}
