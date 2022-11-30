import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { map, startWith } from 'rxjs/operators';
import { LANGUAGES_LIST } from '@core/header/models/languages-list';

@Component({
  selector: 'app-current-language',
  templateUrl: './current-language.component.html',
  styleUrls: ['./current-language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CurrentLanguageComponent {
  public readonly currentLanguage$ = this.translateService.onLangChange.asObservable().pipe(
    startWith({ lang: this.translateService.currentLang }),
    map(languageEvent => this.getCurrentLanguage(languageEvent.lang))
  );

  constructor(private readonly translateService: TranslateService) {}

  // @TODO test 4
  /**
   * Gets current language.
   * @param currentLang code of current language.
   */
  private getCurrentLanguage(currentLang: string): LanguageListElement {
    return LANGUAGES_LIST.find(lang => lang.lng === currentLang);
  }
}
