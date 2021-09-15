import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { languagesList } from 'src/app/core/header/models/languages-list';
import { SettingsComponentData } from 'src/app/core/header/models/settings-component';
import { GasIndicatorComponent } from 'src/app/shared/components/gas-indicator/gas-indicator.component';
import { RubicTogglerThemeComponent } from 'src/app/core/header/components/header/components/rubic-toggler-theme/rubic-toggler-theme.component';
import { CurrentLanguageComponent } from 'src/app/core/header/components/header/components/current-language/current-language.component';
import { TutorialsComponent } from 'src/app/core/header/components/header/components/tutorials/tutorials.component';
import { SettingsListItem } from 'src/app/core/header/models/settings-list-item';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsListComponent {
  public readonly settingsList: SettingsListItem[];

  public readonly $isMobile: Observable<boolean>;

  private themeSubscription$: Subscription;

  /**
   * @description get current language
   * @return object of current language
   */
  public get currentLanguage(): LanguageListElement {
    return languagesList.find(lang => lang.lng === this.translateService.currentLang);
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly translateService: TranslateService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: BehaviorSubject<SettingsComponentData>
  ) {
    this.settingsList = [
      {
        title: 'settings.header.switchTheme.title',
        description: 'settings.header.switchTheme.desc',
        component: new PolymorpheusComponent(RubicTogglerThemeComponent),
        action: this.switchTheme.bind(this)
      },
      {
        title: 'settings.header.language.title',
        description: 'settings.header.language.desc',
        component: new PolymorpheusComponent(CurrentLanguageComponent),
        action: this.switchToLanguageSettings.bind(this),
        arrow: true
      },
      {
        title: 'settings.header.gasPrice.title',
        description: 'settings.header.gasPrice.desc',
        component: new PolymorpheusComponent(GasIndicatorComponent),
        arrow: false
      },
      {
        title: 'settings.header.tutorials.title',
        description: 'settings.header.tutorials.desc',
        component: new PolymorpheusComponent(TutorialsComponent),
        action: this.navigateExternalLink.bind(null, ['https://www.youtube.com/c/RubicExchange']),
        arrow: true
      }
    ];
  }

  /**
   * @description toggle dark or light site theme
   * @return void
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  /**
   * @description navigate by url
   * @param url for navigate
   * @return void
   */
  public navigateExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * @description switch component to LanguageSettings
   * @return void
   */
  public switchToLanguageSettings(): void {
    this.context.next({
      titleKey: 'Languages',
      component: new PolymorpheusComponent(RubicLanguageSelectComponent)
    });
  }
}
