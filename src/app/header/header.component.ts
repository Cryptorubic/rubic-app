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
import { MatDialog, MatDialogRef } from '@angular/material';
import { NavigationStart, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UserInterface } from '../services/user/user.interface';
import { Web3ServiceLEGACY } from '../services/web3LEGACY/web3LEGACY.service';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private isBrowser: any;

  public pageScrolled: boolean;

  public currentUser: UserInterface;

  public openedMenu;

  public userMenuOpened;

  public openedLngList: boolean;

  private translator: TranslateService;

  public languagesList: { lng: string; title: string; active?: boolean }[];

  public currLanguage: string;

  @ViewChild('logoutConfirmation', { static: true }) logoutConfirmation: TemplateRef<any>;

  @ViewChild('headerPage') headerPage;

  private logoutConfirmationModal: MatDialogRef<any>;

  public logoutProgress: boolean;

  @Output() changedSocialState = new EventEmitter<string>();

  public isMobile: boolean = window.innerWidth <= 1024;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private web3Service: Web3ServiceLEGACY,
    private translate: TranslateService,
    private cookieService: CookieService
  ) {
    this.translator = translate;
    this.languagesList = [
      {
        lng: 'en',
        title: 'English'
      },
      {
        lng: 'ko',
        title: '한국어'
      },
      {
        lng: 'zh',
        title: '中国'
      },
      {
        lng: 'ru',
        title: 'Русский'
      }
    ];

    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setActiveLanguage(event);
    });
    this.setActiveLanguage({
      lang: translate.currentLang
    });

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
      this.userMenuOpened = false;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.openedMenu = false;
        this.userMenuOpened = false;
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

  private setActiveLanguage(event) {
    if (this.currLanguage) {
      this.languagesList.filter(lang => {
        return lang['lng'] === this.currLanguage;
      })[0].active = false;
    }
    this.currLanguage = event.lang;
    this.cookieService.set('lng', this.currLanguage, null, null, null, null, null);

    this.languagesList.filter(lang => {
      return lang['lng'] === this.currLanguage;
    })[0].active = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.languagesList.sort((a, b) => {
      return b.active ? 1 : -1;
    });
  }

  public toggleLanguage() {
    this.openedLngList = !this.openedLngList;
  }

  public setLanguage(lng) {
    this.translator.use(lng);
  }
}
