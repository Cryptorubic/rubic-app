import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from '../http/http.service';
import { URLS } from './user.service.api';
import {
  AuthUserInterface,
  NewUserInterface,
  SocialUserInterface,
  UserInterface
} from './user.interface';
import { DEFAULT_USER, SOCIAL_KEYS } from './user.constant';
// import { environment } from '../../../environments/environment';

import { AuthComponent } from '../../common/auth/auth.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private FBInit: boolean;

  private GAInit: boolean;

  private MMInit: boolean;

  constructor(private dialog: MatDialog, private httpService: HttpService) {
    this.userObserves = [];

    if (window['FB']) {
      this.FBInit = true;
      window['FB'].init({
        appId: SOCIAL_KEYS.FACEBOOK,
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.8'
      });
    }
    if (window['gapi']) {
      this.GAInit = true;
      window['gapi'].load('auth2');
    }

    if (window['ethereum'] && window['ethereum'].isMetaMask) {
      this.MMInit = true;
    }
  }

  public userObserves;

  private _userModel: UserInterface;

  private _updateProgress: boolean;

  private authDialog;

  private checkUserProfile() {
    const decimalsBalance = 18;
    this._userModel.visibleBalance = new BigNumber(this._userModel.balance)
      .div(decimalsBalance ** 10)
      .toString();
  }

  private callSubscribers() {
    this.userObserves.forEach(userObserve => {
      this.checkUserProfile();
      userObserve.next(this._userModel);
      this._userModel.isLogout = undefined;
    });
  }

  public updateUser(afterLogout?: boolean): void {
    if (this._updateProgress) {
      return;
    }
    this._updateProgress = true;
    this.getProfile()
      .then(
        result => {
          this._userModel = result;
          this._updateProgress = false;
        },
        () => {
          this._userModel = DEFAULT_USER;
          this._userModel.isLogout = afterLogout;
          this._updateProgress = false;
        }
      )
      .finally(() => {
        this.callSubscribers();
      });
  }

  public checkSocialNetworks(): { FB: boolean; GA: boolean; MM: boolean } {
    return {
      GA: this.GAInit,
      FB: this.FBInit,
      MM: this.MMInit
    };
  }

  public getCurrentUser(withRequest?: boolean, checkNow?: boolean): Observable<any> {
    return new Observable(observer => {
      this.userObserves.push(observer);

      if (withRequest) {
        this.updateUser();
      }

      if (checkNow && !this._updateProgress) {
        setTimeout(() => {
          observer.next(this._userModel);
        });
      }

      const serviceThis = this;

      return {
        unsubscribe() {
          serviceThis.userObserves = serviceThis.userObserves.filter(subscriber => {
            return subscriber !== observer;
          });
        }
      };
    });
  }

  public getUserModel(): UserInterface {
    return this._userModel;
  }

  private getProfile(): Promise<any> {
    return this.httpService.get(URLS.PROFILE).toPromise();
  }

  public authenticate(
    data: AuthUserInterface | SocialUserInterface,
    socialAuthPath?: string
  ): Promise<any> {
    data.username = data.username ? data.username.toLowerCase() : data.username;
    return new Promise((resolve, reject) => {
      this.httpService
        .post(socialAuthPath || URLS.LOGIN, data, URLS.HOSTS.AUTH_PATH)
        .toPromise()
        .then(response => {
          this.updateUser();
          resolve(response);
        }, reject);
    });
  }

  public registration(data: NewUserInterface): Promise<any> {
    data.username = data.username.toLowerCase();
    data.email = data.username.toLowerCase();
    return this.httpService.post(URLS.REGISTRATION, data, URLS.HOSTS.AUTH_PATH).toPromise();
  }

  public passwordReset(email: string): Promise<any> {
    const data = {
      email: email.toLowerCase()
    };
    return this.httpService.post(URLS.PASSWORD_RESET, data, URLS.HOSTS.AUTH_PATH).toPromise();
  }

  public resendConfirmEmail(email: string): Promise<any> {
    const data = {
      email: email.toLowerCase()
    };
    return this.httpService.post(URLS.RESEND_EMAIL, data).toPromise();
  }

  public openAuthForm(chapter?: string) {
    return new Promise((resolve, reject) => {
      const updateUserObserver = this.getCurrentUser(false, true).subscribe(userModel => {
        if (!userModel.is_ghost) {
          this.closeAuthForm();
          resolve(userModel);
        }
      });
      this.authDialog = this.dialog.open(AuthComponent, {
        width: '460px',
        panelClass: 'custom-dialog-container',
        data: {
          chapter: chapter || 'sign_in'
        }
      });
      this.authDialog
        .beforeClosed()
        .toPromise()
        .then(() => {
          updateUserObserver.unsubscribe();
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            state: 'CLOSED'
          });
        });
    });
  }

  private closeAuthForm() {
    if (this.authDialog) {
      this.authDialog.close();
    }
  }

  public logout() {
    return this.httpService
      .get(URLS.LOGOUT, {}, URLS.HOSTS.AUTH_PATH)
      .toPromise()
      .then(() => {
        this._userModel = undefined;
        this.updateUser(true);
      });
  }

  public enable2fa(code) {
    return this.httpService
      .post(URLS.ENABLE_2FA, {
        totp: code
      })
      .toPromise();
  }

  public disable2fa(code) {
    return this.httpService
      .post(URLS.DISABLE_2FA, {
        totp: code
      })
      .toPromise();
  }

  public generate2fa() {
    return this.httpService.post(URLS.GENERATE_KEY).toPromise();
  }

  public setNewPassword(data) {
    return this.httpService.post(URLS.PASSWORD_CHANGE, data, URLS.HOSTS.AUTH_PATH).toPromise();
  }

  public passwordChange(data) {
    return this.httpService
      .post(URLS.PASSWORD_RESET_CONFIRM, data, URLS.HOSTS.AUTH_PATH)
      .toPromise();
  }

  public socialAuthRequest(network, data) {
    switch (network) {
      case 'fb':
        return this.authenticate(data, URLS.SOCIAL.FACEBOOK);
      case 'ga':
        return this.authenticate(data, URLS.SOCIAL.GOOGLE);
      default:
        break;
    }
    return null;
  }

  public getMetaMaskAuthMsg() {
    return this.httpService.get('get_metamask_message/').toPromise();
  }

  public metaMaskAuth(data) {
    return new Promise((resolve, reject) => {
      this.httpService
        .post('metamask/', data, URLS.HOSTS.AUTH_PATH)
        .toPromise()
        .then(response => {
          this.updateUser();
          resolve(response);
        }, reject);
    });
  }

  public FBAuth(): Promise<any> {
    return new Promise(resolve => {
      const getStatus = () => {
        window['FB'].getLoginStatus(response => {
          if (response.status === 'connected') {
            resolve(response.authResponse);
          } else {
            window['FB'].login(() => {
              getStatus();
            });
          }
        });
      };
      getStatus();
    });
  }

  public GoogleAuth() {
    return new Promise((resolve, reject) => {
      window['gapi'].auth2.authorize(
        {
          client_id: SOCIAL_KEYS.GOOGLE,
          scope: 'email profile',
          response_type: 'id_token permission',
          prompt: 'select_account'
        },
        function (response) {
          if (response.error) {
            reject(response);
            return;
          }
          resolve(response);
        }
      );
    });
  }

  // var promise = requestService.get(params);
  // promise.then(function(responseSocialUserInterface) {
  //   if (response.data.id) {
  // !WebSocketService.status() ? WebSocketService.connect() : false;
  // $cookies.put('UserID', response.data.id);
  // } else {
  // WebSocketService.status() ? WebSocketService.disconnect() : false;
  // $cookies.put('UserID', undefined);
  // }
  // }, function() {
  // WebSocketService.status() ? WebSocketService.disconnect() : false;
  // $cookies.put('UserID', undefined);
  // });
  // return promise;
  // },

  // setLanguage: function(lng) {
  //   var params = {
  //     path: API.SET_LNG,
  //     data: {
  //       lang: lng
  //     }
  //   };
  //   return requestService.post(params);
  // }
}
