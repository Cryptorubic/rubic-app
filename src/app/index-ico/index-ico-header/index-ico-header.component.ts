import {Component, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';

import {IndexIcoFormComponent} from '../index-ico-form/index-ico-form.component';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-index-ico-header',
  templateUrl: './index-ico-header.component.html',
  styleUrls: ['./index-ico-header.component.scss']
})
export class IndexIcoHeaderComponent implements OnInit {
  public pageScrolled: boolean;

  public currLanguage: string;
  public openedLngList = false;

  private translator: TranslateService;
  public openedMenu;
  public userMenuOpened;

  public languagesList: { lng: string; title: string; active?: boolean }[];

  @ViewChild('logoutConfirmation') logoutConfirmation: TemplateRef<any>;
  @ViewChild('headerPage') headerPage;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private dialog: MatDialog,
    private router: Router,
    translate: TranslateService
  ) {

    this.translator = translate;
    this.languagesList = [
      {
        lng: 'en',
        title: 'EN'
      },
      {
        lng: 'ru',
        title: 'RU'
      },
      {
        lng: 'zh',
        title: 'ZH'
      },
      {
        lng: 'ko',
        title: 'KO'
      }
    ];

    window.onscroll = () => {
      const scrolled = window.pageYOffset || document.documentElement.scrollTop;
      this.pageScrolled = scrolled > 50;
    };


    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setActiveLanguage(event);
    });
    this.setActiveLanguage({
      lang: translate.currentLang
    });

    document.getElementsByTagName('body')[0]['addEventListener'](
      'mousedown',
      (event) => {
        this.openedMenu = false;
        this.userMenuOpened = false;
      }
    );
  }

  private setActiveLanguage(event) {
    if (this.currLanguage) {
      this.languagesList.filter((lang) => {
        return lang['lng'] === this.currLanguage;
      })[0].active = false;
    }

    if (!event.lang) {
      return;
    }
    this.currLanguage = event.lang;
    window['jQuery']['cookie']('lng', this.currLanguage);

    this.languagesList.filter((lang) => {
      return lang['lng'] === this.currLanguage;
    })[0].active = true;
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

  public openInviteForm($event) {
    this.dialog.open(IndexIcoFormComponent, {
      width: '380px',
      panelClass: 'custom-dialog-container',
      data: {}
    });
  }

  ngOnInit() {

  }



}
