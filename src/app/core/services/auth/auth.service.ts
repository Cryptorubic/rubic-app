import { Injectable } from '@angular/core';
import { HeaderStore } from '../../header/services/header.store';
import { UserService } from '../user/user.service';

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly headerStore: HeaderStore
  ) {}

  private sendMetaMaskRequest(data) {
    this.userService.metaMaskAuth(data).then(() => {
      this.headerStore.setUserMenuOpeningStatus(false);
    });
  }

  public metamaskAuth() {
    // if (window['ethereum'] && window['ethereum'].isMetaMask) {
    //   window['ethereum'].enable().then(accounts => {
    //     const address = accounts[0];
    //     this.userService.getMetaMaskAuthMsg().then(msg => {
    //       this.web3Service.getSignedMetaMaskMsg(msg, address).then(signed => {
    //         this.sendMetaMaskRequest({
    //           address,
    //           msg,
    //           signed_msg: signed
    //         });
    //       });
    //     });
    //   });
    // }
  }
}
