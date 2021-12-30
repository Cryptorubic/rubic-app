import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  QueryList,
  Self,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { LANGUAGES_LIST } from '@core/header/models/languages-list';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { BehaviorSubject } from 'rxjs';
import { SettingsComponentData } from 'src/app/core/header/models/settings-component';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-rubic-language-select',
  templateUrl: './rubic-language-select.component.html',
  styleUrls: ['./rubic-language-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RubicLanguageSelectComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<unknown>>;

  public readonly languagesList: LanguageListElement[];

  public currentLanguage: string;

  constructor(
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context$: BehaviorSubject<SettingsComponentData>,
    @Self() destroy$: TuiDestroyService
  ) {
    this.languagesList = LANGUAGES_LIST;
    translateService.onLangChange.pipe(takeUntil(destroy$)).subscribe((event: LangChangeEvent) => {
      this.setActiveLanguage(event);
    });
    this.setActiveLanguage({
      lang: translateService.currentLang
    });
  }

  /**
   * Setup new active site language.
   * @param event language what need set.
   */
  private setActiveLanguage(event: Partial<LangChangeEvent>): void {
    this.cdr.markForCheck();
    if (this.currentLanguage) {
      this.languagesList.filter(lang => {
        return lang.active === Boolean(this.currentLanguage);
      })[0].active = false;
    }
    this.currentLanguage = event.lang || LANGUAGES_LIST[0].lng;
    this.cookieService.set('lng', this.currentLanguage, null, null, null, null, null);
    this.languagesList.filter(lang => {
      return lang.lng === this.currentLanguage;
    })[0].active = true;
  }

  /**
   * Set new current language.
   * @param lng new current language.
   */
  public setLanguage(lng: string): void {
    this.context$.next({
      titleKey: 'Settings',
      component: new PolymorpheusComponent(SettingsListComponent)
    });
    this.translateService.use(lng);
  }
}
