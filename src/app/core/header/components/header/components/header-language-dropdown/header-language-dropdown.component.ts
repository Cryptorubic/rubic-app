import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { languagesList } from 'src/app/core/header/models/languages-list';
import { QueryParamsService } from '../../../../../services/query-params/query-params.service';

@Component({
  selector: 'app-header-language-dropdown',
  templateUrl: './header-language-dropdown.component.html',
  styleUrls: ['./header-language-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderLanguageDropdownComponent {
  public isLanguageslistOpened: boolean;

  public readonly languagesList: LanguageListElement[];

  public currentLanguage: string;

  constructor(
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService
  ) {
    this.languagesList = languagesList;
    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setActiveLanguage(event);
    });
    this.setActiveLanguage({
      lang: translateService.currentLang
    });
  }

  private setActiveLanguage(event) {
    this.cdr.markForCheck();
    if (this.currentLanguage) {
      this.languagesList.filter(lang => {
        return lang.active === Boolean(this.currentLanguage);
      })[0].active = false;
    }
    this.currentLanguage = event.lang || languagesList[0].lng;
    this.cookieService.set('lng', this.currentLanguage, null, null, null, null, null);
    this.languagesList.filter(lang => {
      return lang.lng === this.currentLanguage;
    })[0].active = true;
    this.languagesList.sort((...params) => {
      return params.pop().active ? 1 : -1;
    });

    this.queryParamsService.setQueryParam('lang', this.currentLanguage);
  }

  public toggleLanguageDropdown() {
    this.isLanguageslistOpened = !this.isLanguageslistOpened;
  }

  public setLanguage(lng: string) {
    this.translateService.use(lng);
    this.queryParamsService.setQueryParam('lang', lng);
  }
}
