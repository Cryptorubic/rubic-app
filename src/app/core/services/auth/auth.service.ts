import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { HeaderStore } from '../../header/services/header.store';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';
import { HttpService } from '../http/http.service';
import { MetamaskLoginInterface, UserInterface } from './models/user.interface';
import { URLS } from './models/user.service.api';

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
    private readonly web3Service: Web3PrivateService
  ) {
    this.$currentUser = new BehaviorSubject<UserInterface>(undefined);
    this.web3Service.onAddressChanges.subscribe(address => {
      if (this.isAuthProcess) {
        return;
      }
      const user = this.$currentUser.getValue();
      // user inited, account not authorized on backend or authorized other account
      if (address && user && user.address !== address) {
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
   * @description Fetch authorized user address or auth message in case there's no authorized user.
   */
  private fetchMetamaskLoginBody(): Observable<MetamaskLoginInterface> {
    return this.httpService.get('metamask/login/', {}, URLS.HOSTS.AUTH_PATH);
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
      .post(
        'metamask/login/',
        { address, message: nonce, signed_message: signature },
        URLS.HOSTS.AUTH_PATH
      )
      .toPromise();
  }

  public async loadUser() {
    this.isAuthProcess = true;
    this.fetchMetamaskLoginBody().subscribe(
      async metamaskLoginBody => {
        if (metamaskLoginBody.wallet_address) {
          await this.web3Service.activate();
          if (metamaskLoginBody.wallet_address === this.web3Service.address) {
            this.$currentUser.next({ address: metamaskLoginBody.wallet_address });
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
  public async signIn(): Promise<void> {
    this.isAuthProcess = true;
    await this.web3Service.activate();
    const { message } = await this.fetchMetamaskLoginBody().toPromise();
    const signature = await this.web3Service.signPersonal(message);

    await this.sendSignedNonce(this.web3Service.address, message, signature);

    this.$currentUser.next({ address: this.web3Service.address });
    this.isAuthProcess = false;
  }

  /**
   * @description Logout request to backend.
   */
  public signOut(): Observable<string> {
    return this.httpService.get('metamask/logout/', {}, URLS.HOSTS.AUTH_PATH).pipe(
      finalize(() => {
        this.$currentUser.next(null);
        this.web3Service.deActivate();
      })
    );
  }
}
