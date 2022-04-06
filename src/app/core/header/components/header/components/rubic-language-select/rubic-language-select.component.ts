import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { LANGUAGES_LIST } from '@core/header/models/languages-list';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { BehaviorSubject } from 'rxjs';
import { SettingsComponentData } from 'src/app/core/header/models/settings-component';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-rubic-language-select',
  templateUrl: './rubic-language-select.component.html',
  styleUrls: ['./rubic-language-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RubicLanguageSelectComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<unknown>>;

  public readonly languagesList: LanguageListElement[] = LANGUAGES_LIST;

  public readonly currentLanguage: string = this.translateService.currentLang;

  constructor(
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context$: BehaviorSubject<SettingsComponentData>
  ) {}

  /**
   * Sets new current language.
   * @param language New current language.
   */
  public setLanguage(language: string): void {
    this.cdr.markForCheck();
    this.translateService.use(language);
    this.cookieService.set('lng', language, null, null, null, null, null);
    this.context$.next({
      titleKey: 'Settings',
      component: new PolymorpheusComponent(SettingsListComponent)
    });
  }
}
