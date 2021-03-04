import {
  Component,
  Inject,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { Web3Service } from '../../services/web3/web3.service';
import { UserInterface } from '../../services/user/user.interface';

@Component({
  selector: 'app-header-main-page',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderMainPageComponent {
  private isBrowser: any;

  public pageScrolled: boolean;

  public currentUser: UserInterface;

  public openedMenu;

  public infoMenuOpened;

  public devMenuOpened;

  public productMenuOpened;

  @ViewChild('logoutConfirmation') logoutConfirmation: TemplateRef<any>;

  @ViewChild('headerPage') headerPage;

  private logoutConfirmationModal: MatDialogRef<any>;

  private logoutProgress: boolean;

  @Output() changedSocialState = new EventEmitter<string>();

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private web3Service: Web3Service
  ) {
    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
    });

    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      window.onscroll = () => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        this.pageScrolled = scrolled > 50;
      };
    }

    document.getElementsByTagName('body')[0].addEventListener('mousedown', () => {
      this.openedMenu = false;
      this.infoMenuOpened = false;
      this.productMenuOpened = false;
      this.devMenuOpened = false;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.openedMenu = false;
        this.infoMenuOpened = false;
        this.productMenuOpened = false;
        this.devMenuOpened = false;
      }
    });
  }

  private socialFormData: {
    network: string;
    data: any;
  };

  public socialAuthError;

  // public openAuth() {
  // this.userService.openAuthForm().then(
  //   () => {},
  //   () => {},
  // );
  // this.socialComponent.MetamaskAuth();
  // }

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

  public openLogoutConfirmation() {
    this.logoutConfirmationModal = this.dialog.open(this.logoutConfirmation, {
      width: '480px',
      panelClass: 'custom-dialog-container'
    });
  }

  public logoutSuccess() {
    this.logoutProgress = true;
    this.userService
      .logout()
      .then(() => {
        this.logoutConfirmationModal.close();
      })
      .finally(() => {
        this.logoutProgress = false;
      });
  }
}
