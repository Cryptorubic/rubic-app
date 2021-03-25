import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HeaderStore } from '../../header/services/header.store';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';
import { HttpService } from '../http/http.service';
import { UserInterface } from './models/user.interface';
import { URLS } from './models/user.service.api';

interface BackendUser {
  isLogout?: boolean;
  balance: number;
  eos_balance: number;
  visibleBalance: string;
  contracts: number;
  eos_address: string;
  id: number;
  internal_address: string;
  internal_btc_address: string;
  is_social: boolean;
  lang: string;
  memo: string;
  use_totp: boolean;
  username: string;
  is_ghost?: boolean;
  is_swaps_admin?: any;
}

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
  private isAuthProcess: boolean = false;

  /**
   * Current user data.
   */
  private readonly $currentUser: BehaviorSubject<UserInterface>;

  get user(): UserInterface {
    return this.$currentUser.getValue();
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService,
    private readonly web3Service: Web3PrivateService,
    private readonly httpClient: HttpClient
  ) {
    this.$currentUser = new BehaviorSubject<UserInterface>(undefined);
    this.web3Service.onAddressChanges.subscribe(address => {
      if (this.isAuthProcess) {
        return;
      }
      const user = this.$currentUser.getValue();
      // user inited, account not authorized on backend or authorized other account
      if (user !== undefined && (user === null || user?.address !== address) && address) {
        /* this.$currentUser.next(null);
        this.signIn(); */
        window.location.reload();
        // TODO: надо продумать модальные окна на кейсы, когда юзер сменил адрес в метамаске но не подписал nonce с бэка
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
   * @description Fetch user data from backend.
   */
  private fetchUser(): Observable<UserInterface> {
    return this.httpService
      .get(URLS.PROFILE)
      .pipe(map((user: BackendUser) => ({ address: user.username })));
  }

  /**
   * @description Fetch metamask auth message for sign.
   */
  private fetchAuthNonce(): Promise<string> {
    return this.httpService.get('get_metamask_message/').toPromise();
  }

  /**
   * @description Authenticate user on backend.
   * @param address wallet address
   * @param nonce nonce to sign
   * @param signature signed nonce
   * @return Authenticztion key.
   */
  private sendSignedNonce(address: string, nonce: string, signature: string): Promise<void> {
    return this.httpService
      .post('metamask/', { address, message: nonce, signed_msg: signature }, URLS.HOSTS.AUTH_PATH)
      .toPromise();
  }

  public async loadUser() {
    this.isAuthProcess = true;
    this.fetchUser().subscribe(
      async user => {
        await this.web3Service.activate();
        if (this.web3Service.address !== user.address) {
          this.signOut()
            .pipe(
              finalize(() => {
                this.signIn();
              })
            )
            .subscribe();
        } else {
          this.$currentUser.next(user);
        }
        this.isAuthProcess = false;
      },
      () => this.$currentUser.next(null)
    );
  }

  /**
   * @description Initiate authentication via metamask.
   */
  public async signIn(): Promise<void> {
    this.isAuthProcess = true;
    await this.web3Service.activate();
    const nonce = await this.fetchAuthNonce();
    const signature = await this.web3Service.signPersonal(nonce);

    await this.sendSignedNonce(this.web3Service.address, nonce, signature);

    this.fetchUser().subscribe(user => {
      this.$currentUser.next(user);
      this.isAuthProcess = false;
    });
    this.headerStore.setUserMenuOpeningStatus(false);
  }

  /**
   * @description Logout request to backend.
   */
  public signOut(): Observable<string> {
    return this.httpService.get(URLS.LOGOUT, {}, URLS.HOSTS.AUTH_PATH).pipe(
      finalize(() => {
        this.$currentUser.next(null);
        this.web3Service.deActivate();
      })
    );
  }
}
