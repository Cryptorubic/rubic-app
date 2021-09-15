import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Inject
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';
import { SettingsComponent } from 'src/app/core/header/components/header/components/header-settings/header-settings.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { languagesList } from 'src/app/core/header/models/languages-list';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsListComponent {
  @Output() type = new EventEmitter<string>();

  public readonly $isMobile: Observable<boolean>;

  private themeSubscription$: Subscription;

  public get currentLanguage(): LanguageListElement {
    return languagesList.find(lang => lang.lng === this.translateService.currentLang);
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly translateService: TranslateService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: BehaviorSubject<{
      titleKey: string;
      component: PolymorpheusComponent<SettingsComponent, object>;
    }>
  ) {}

  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  public navigateExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  public switchToLanguageSettings(): void {
    this.context.next({
      titleKey: 'Languages',
      component: new PolymorpheusComponent(RubicLanguageSelectComponent)
    });
  }
}
