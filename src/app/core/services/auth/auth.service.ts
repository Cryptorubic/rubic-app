import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { finalize, mergeMap } from 'rxjs/operators';
import { HeaderStore } from '../../header/services/header.store';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';
import { HttpService } from '../http/http.service';
import { UserInterface } from '../user/user.interface';
import { URLS } from '../user/user.service.api';

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Current user data.
   */
  private readonly $currentUser: BehaviorSubject<UserInterface>;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService,
    private readonly web3Service: Web3PrivateService
  ) {
    this.$currentUser = new BehaviorSubject<UserInterface>(undefined);
  }

  /**
   * Ger current user as observable.
   * @returns User.
   */
  public getCurrentUser(): Observable<UserInterface> {
    return this.$currentUser.asObservable();
  }

  /**
   * Fetch user data from backend.
   */
  public fetchUser(): void {
    this.httpService.get(URLS.PROFILE).subscribe(
      (user: UserInterface) => {
        this.$currentUser.next(user);
      },
      () => {
        this.$currentUser.next(null);
      }
    );
  }

  /**
   * Fetch metamask auth message for sign.
   */
  public fetchMetaMaskAuthMsg(): Observable<string> {
    return this.httpService.get('get_metamask_message/');
  }

  /**
   * Authenticate user ob backend.
   * @param data Data for authentication (addres, message, signed message).
   * @return Authenticztion key.
   */
  public metaMaskBackendAuth(data: {
    address: string;
    message: string;
    signed_msg: string;
  }): Observable<{ key: string }> {
    return this.httpService.post('metamask/', data, URLS.HOSTS.AUTH_PATH);
  }

  /**
   * Initiate authentication via metamask.
   */
  public metamaskAuth(): void {
    if ((window as any).ethereum) {
      const authData = {
        address: <string>undefined,
        message: <string>undefined,
        signed_msg: <string>undefined
      };
      from((window as any).ethereum.request({ method: 'eth_requestAccounts' }))
        .pipe(
          mergeMap((accounts: any[]) => {
            [authData.address] = accounts;
            return this.fetchMetaMaskAuthMsg();
          }),
          mergeMap((msg: any) => {
            authData.message = msg;
            return (this.web3Service as any).web3.eth.personal.sign(
              authData.message,
              authData.address
            );
          }),
          mergeMap((signed: any) => {
            authData.signed_msg = signed;
            return this.metaMaskBackendAuth(authData);
          })
        )
        .subscribe(() => {
          this.fetchUser();
          this.headerStore.setUserMenuOpeningStatus(false);
        });
    }
  }

  /**
   * Logout request to backend.
   */
  public logoutRequest(): Observable<string> {
    return this.httpService.get(URLS.LOGOUT, {}, URLS.HOSTS.AUTH_PATH).pipe(
      finalize(() => {
        this.$currentUser.next(null);
      })
    );
  }
}
