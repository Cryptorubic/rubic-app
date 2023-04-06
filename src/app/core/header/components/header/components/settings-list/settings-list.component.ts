import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { SettingsComponentData } from 'src/app/core/header/models/settings-component';
import { CurrentLanguageComponent } from 'src/app/core/header/components/header/components/current-language/current-language.component';
import { SettingsListItem } from 'src/app/core/header/models/settings-list-item';
import { ThemeSwitcherComponent } from 'src/app/core/header/components/header/components/theme-switcher/theme-switcher.component';
import { LANGUAGES_LIST } from '@core/header/models/languages-list';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsListComponent {
  public readonly settingsList: SettingsListItem[];

  /**
   * Gets current language.
   * @return LanguageListElement current language object.
   */
  public get currentLanguage(): LanguageListElement {
    return LANGUAGES_LIST.find(lang => lang.lng === this.translateService.currentLang);
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly translateService: TranslateService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context$: BehaviorSubject<SettingsComponentData>
  ) {
    this.settingsList = [
      {
        title: 'settings.header.switchTheme.title',
        description: 'settings.header.switchTheme.desc',
        component: new PolymorpheusComponent(ThemeSwitcherComponent),
        action: this.switchTheme.bind(this)
      },
      {
        title: 'settings.header.language.title',
        description: 'settings.header.language.desc',
        component: new PolymorpheusComponent(CurrentLanguageComponent),
        action: this.switchToLanguageSettings.bind(this),
        arrow: true
      }
    ];
  }

  /**
   * Toggle dark or light site theme.
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  /**
   * Navigate by url.
   * @param Url for navigate.
   */
  public navigateExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Switch component to LanguageSettings.
   */
  public switchToLanguageSettings(): void {
    this.context$.next({
      titleKey: 'Languages',
      component: new PolymorpheusComponent(RubicLanguageSelectComponent)
    });
  }
}
