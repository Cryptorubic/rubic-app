import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { languagesList } from 'src/app/core/header/models/languages-list';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { BehaviorSubject } from 'rxjs';
import { SettingsComponentData } from 'src/app/core/header/models/settings-component';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';

@Component({
  selector: 'app-rubic-language-select',
  templateUrl: './rubic-language-select.component.html',
  styleUrls: ['./rubic-language-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicLanguageSelectComponent {
  public readonly languagesList: LanguageListElement[];

  public currentLanguage: string;

  /**
   * @description get current language object
   * @return object of current language
   */
  get filteredLanguageList(): LanguageListElement[] {
    return this.languagesList.filter(language => !language.active);
  }

  constructor(
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: BehaviorSubject<SettingsComponentData>
  ) {
    this.languagesList = languagesList;
    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setActiveLanguage(event);
    });
    this.setActiveLanguage({
      lang: translateService.currentLang
    });
  }

  /**
   * @description setup new active site language
   * @param event language what need set
   * @return void
   */
  private setActiveLanguage(event: Partial<LangChangeEvent>) {
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

  /**
   * @description set new current language
   * @param lng new current language
   * @return void
   */
  public setLanguage(lng: string): void {
    this.translateService.use(lng);
    this.switchToSettingsList();
  }

  /**
   * @description switch component to settings list
   * @return void
   */
  public switchToSettingsList(): void {
    this.context.next({
      titleKey: 'Languages',
      component: new PolymorpheusComponent(SettingsListComponent)
    });
  }
}
