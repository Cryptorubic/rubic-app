import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LANGUAGES_LIST } from '@core/header/models/languages-list';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorComponent {
  public readonly languages = LANGUAGES_LIST;

  public readonly activeLanguage$ = this.translateService.onLangChange.pipe(
    startWith({ lang: this.translateService.defaultLang }),
    map(lang => {
      return this.languages.find(el => el.lng === lang.lang);
    })
  );

  // this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(currentLang => {
  //   this.currentLanguage = this.getCurrentLanguage(currentLang.lang);
  //   this.cdr.detectChanges();
  // });

  public isOpened = false;

  constructor(
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService
  ) {}

  public setLanguage(language: string): void {
    this.translateService.use(language);
    this.cookieService.set('lng', language);
    this.isOpened = false;
  }
}
