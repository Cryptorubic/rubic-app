import {Component, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewChild} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {UserService} from '../../services/user/user.service';
import {UserInterface} from '../../services/user/user.interface';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private isBrowser: any;
  public pageScrolled: boolean;
  public currentUser: UserInterface;

  @ViewChild('logoutConfirmation') logoutConfirmation: TemplateRef<any>;

  private logoutConfirmationModal: MatDialogRef<any>;
  private logoutProgress: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private userService: UserService,
    private dialog: MatDialog
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
  }

  public openAuth() {
    this.userService.openAuthForm().then(() => {}, () => {});
  }

  ngOnInit() {
  }



  public openLogoutConfirmation() {
    this.logoutConfirmationModal = this.dialog.open(this.logoutConfirmation, {
      width: '480px',
      panelClass: 'custom-dialog-container'
    });
  }

  public logoutSuccess() {
    this.logoutProgress = true;
    this.userService.logout().then(() => {
      this.logoutConfirmationModal.close();
    }).finally(() => {
      this.logoutProgress = false;
    });
  }


}
