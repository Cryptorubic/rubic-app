import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { UserInterface } from '../../services/user/user.interface';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NavigationStart, Router } from '@angular/router';
import { Web3Service } from '../../services/web3/web3.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private isBrowser: any;
  public pageScrolled: boolean;
  public currentUser: UserInterface;

  public openedMenu;
  public userMenuOpened;
  public userMetamaskAddr;

  @ViewChild('logoutConfirmation') logoutConfirmation: TemplateRef<any>;
  @ViewChild('headerPage') headerPage;

  private logoutConfirmationModal: MatDialogRef<any>;
  private logoutProgress: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,

    private Web3Service: Web3Service,
  ) {
    this.currentUser = this.userService.getUserModel();
    this.userService
      .getCurrentUser()
      .subscribe((userProfile: UserInterface) => {
        this.currentUser = userProfile;
      });

    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      window.onscroll = () => {
        const scrolled =
          window.pageYOffset || document.documentElement.scrollTop;
        this.pageScrolled = scrolled > 50;
      };
    }

    document
      .getElementsByTagName('body')[0]
      ['addEventListener']('mousedown', (event) => {
        this.openedMenu = false;
        this.userMenuOpened = false;
      });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.openedMenu = false;
        this.userMenuOpened = false;
      }
    });
  }

  public openAuth() {
    this.userService.openAuthForm().then(
      () => {},
      () => {},
    );
  }

  public authMetamask() {
    this.Web3Service.authMetamask();
  }

  ngOnInit() {
    this.userMetamaskAddr = this.Web3Service.getUserAddress();
  }

  public openLogoutConfirmation() {
    this.logoutConfirmationModal = this.dialog.open(this.logoutConfirmation, {
      width: '480px',
      panelClass: 'custom-dialog-container',
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
