import {Component, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {NavigationStart, Router} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {IndexIcoFormComponent} from '../index-ico-form/index-ico-form.component';

@Component({
  selector: 'app-index-ico-header',
  templateUrl: './index-ico-header.component.html',
  styleUrls: ['./index-ico-header.component.scss']
})
export class IndexIcoHeaderComponent implements OnInit {
  private isBrowser: any;
  public pageScrolled: boolean;

  public openedMenu;
  public userMenuOpened;

  @ViewChild('logoutConfirmation') logoutConfirmation: TemplateRef<any>;
  @ViewChild('headerPage') headerPage;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private dialog: MatDialog,
    private router: Router
  ) {

    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      window.onscroll = () => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        this.pageScrolled = scrolled > 50;
      };
    }

    document.getElementsByTagName('body')[0]['addEventListener'](
      'mousedown',
      (event) => {
        this.openedMenu = false;
        this.userMenuOpened = false;
      }
    );
  }


  public openInviteForm() {
    this.dialog.open(IndexIcoFormComponent, {
      width: '380px',
      panelClass: 'custom-dialog-container',
      data: {}
    });
  }

  ngOnInit() {

  }



}
