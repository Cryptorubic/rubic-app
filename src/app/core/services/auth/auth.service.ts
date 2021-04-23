import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { HeaderStore } from '../../header/services/header.store';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';
import { HttpService } from '../http/http.service';
import { MetamaskLoginInterface, UserInterface } from './models/user.interface';

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

  private readonly USER_IS_IN_SESSION_CODE = '1000';

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
    this.fetchMetamaskLoginBody().subscribe(
      async metamaskLoginBody => {
        if (metamaskLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
          await this.web3Service.activate();

          const { address } = metamaskLoginBody.payload.user;
          if (address === this.web3Service.address) {
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
   * @description Login user without backend.
   */
  public async loginWithoutbackend(): Promise<void> {
    await this.web3Service.activate();
    const { address } = this.web3Service;
    this.$currentUser.next(address ? { address } : null);
  }

  /**
   * @description Initiate authentication via metamask.
   */
  public async signIn(): Promise<void> {
    this.isAuthProcess = true;
    await this.web3Service.activate();
    const nonce = (await this.fetchMetamaskLoginBody().toPromise()).payload.message;
    const signature = await this.web3Service.signPersonal(nonce);
    await this.sendSignedNonce(this.web3Service.address, nonce, signature);
    this.$currentUser.next({ address: this.web3Service.address });
    this.isAuthProcess = false;
  }

  public async signInWithoudBackend(): Promise<void> {
    this.isAuthProcess = true;
    await this.web3Service.activate();
    const { address } = this.web3Service;
    this.$currentUser.next({ address } || null);
    this.isAuthProcess = false;
  }

  /**
   * @description Logout request to backend.
   */
  public signOut(): Observable<string> {
    return this.httpService.post('metamask/logout/', {}).pipe(
      finalize(() => {
        this.$currentUser.next(null);
        this.web3Service.deActivate();
      })
    );
  }
}
