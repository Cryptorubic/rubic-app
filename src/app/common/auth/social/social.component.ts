import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../../core/services/user/user.service';
import { Web3Service } from '../../../core/services/web3/web3.service';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class SocialComponent {
  @Output() changedSocialState = new EventEmitter<string>();

  public socialAuthError;

  public social: { FB: boolean; GA: boolean; MM: boolean; eoslynx?: boolean } = {
    FB: false,
    GA: false,
    MM: false
  };

  public change2FAProgress: boolean;

  constructor(private userService: UserService, private web3Service: Web3Service) {
    this.social = userService.checkSocialNetworks();
  }

  private socialFormData: {
    network: string;
    data: any;
  };

  public reset2FACode() {
    this.socialAuthError = '1032';
  }

  private onTotpError(error) {
    switch (error.status) {
      case 403:
        this.socialAuthError = error.error.detail;
        switch (error.error.detail) {
          case '1032':
          case '1033':
            this.changedSocialState.emit(error.error.detail);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  public RequestSocialAuth() {
    this.change2FAProgress = true;

    this.userService
      .socialAuthRequest(this.socialFormData.network, this.socialFormData.data)
      .then(
        () => {},
        error => {
          this.onTotpError(error);
        }
      )
      .finally(() => {
        this.change2FAProgress = false;
      });
  }

  public continueSocialAuth(totp) {
    this.socialFormData.data.totp = totp;
    if (this.socialFormData.network === 'mm') {
      this.sendMetaMaskRequest(this.socialFormData.data);
      return;
    }
    this.RequestSocialAuth();
  }

  public GoogleAuth() {
    this.userService.GoogleAuth().then(
      (response: { totp: string; access_token: string }) => {
        this.socialFormData = {
          network: 'ga',
          data: {
            access_token: response.access_token,
            totp: response.totp
          }
        };
        this.RequestSocialAuth();
      },
      () => {
        // console.log(error);
      }
    );
  }

  private sendMetaMaskRequest(data) {
    this.socialFormData = {
      network: 'mm',
      data
    };
    this.userService.metaMaskAuth(data).then(
      result => {
        console.log(result);
      },
      error => {
        this.onTotpError(error);
      }
    );
  }

  public MetamaskAuth() {
    if (window['ethereum'] && window['ethereum'].isMetaMask) {
      window['ethereum'].enable().then(accounts => {
        const address = accounts[0];
        this.userService.getMetaMaskAuthMsg().then(msg => {
          this.web3Service.getSignedMetaMaskMsg(msg, address).then(signed => {
            this.sendMetaMaskRequest({
              address,
              msg,
              signed_msg: signed
            });
          });
        });
      });
    }
  }

  public FBAuth() {
    this.userService.FBAuth().then(
      (response: { totp: string; accessToken: string }) => {
        this.socialFormData = {
          network: 'fb',
          data: {
            access_token: response.accessToken,
            totp: response.totp
          }
        };
        this.RequestSocialAuth();
      },
      error => {
        console.log(error);
      }
    );
  }
}
