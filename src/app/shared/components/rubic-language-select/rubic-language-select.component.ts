import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { languagesList } from 'src/app/core/header/models/languages-list';
import { LanguageListElement } from '../../../core/header/models/language-list-element';

@Component({
  selector: 'app-rubic-language-select',
  templateUrl: './rubic-language-select.component.html',
  styleUrls: ['./rubic-language-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicLanguageSelectComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  public readonly languagesList: LanguageListElement[];

  public currentLanguage: string;

  get filteredLanguageList(): LanguageListElement[] {
    return this.languagesList.filter(language => !language.active);
  }

  constructor(
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly cdr: ChangeDetectorRef
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
  }

  public onLangChange(filteredLanguageIndex: number) {
    const language = this.filteredLanguageList[filteredLanguageIndex];
    this.translateService.use(language.lng);
  }
}
