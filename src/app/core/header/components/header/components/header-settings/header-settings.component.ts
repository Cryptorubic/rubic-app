import {
  ChangeDetectorRef,
  Input,
  TemplateRef,
  Injector,
  Inject,
  Component,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TuiHostedDropdownComponent } from '@taiga-ui/core';
import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';

export type SettingsComponent = RubicLanguageSelectComponent | SettingsListComponent;

interface HeaderSettingsComponentData {
  titleKey: string;
  component: PolymorpheusComponent<SettingsComponent, object>;
}

@Component({
  selector: 'app-header-settings',
  templateUrl: './header-settings.component.html',
  styleUrls: ['./header-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSettingsComponent {
  @Input() displaySettings = false;

  @ViewChild(TuiHostedDropdownComponent)
  component?: TuiHostedDropdownComponent;

  public isSettingsOpened = false;

  public isDefaultComponent: boolean;

  public readonly $isMobile: Observable<boolean>;

  private themeSubscription$: Subscription;

  public template: TemplateRef<unknown>;

  public currentComponent$: BehaviorSubject<HeaderSettingsComponentData>;

  public defaultComponent: HeaderSettingsComponentData;

  public get dynamicComponent$(): Observable<HeaderSettingsComponentData> {
    return this.currentComponent$.asObservable();
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService,
    @Inject(Injector) public readonly injector: Injector
  ) {
    this.defaultComponent = {
      titleKey: 'Settings',
      component: new PolymorpheusComponent(SettingsListComponent)
    };
    this.currentComponent$ = new BehaviorSubject(this.defaultComponent);
    this.currentComponent$.pipe(takeUntil(this.destroy$)).subscribe(({ component }) => {
      this.isDefaultComponent = component === this.defaultComponent.component;
    });
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
  }

  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  public backToSettings(): void {
    this.currentComponent$.next(this.defaultComponent);
  }

  public closeSettings() {
    this.isSettingsOpened = false;

    if (this.component && this.component.nativeFocusableElement) {
      this.component.nativeFocusableElement.focus();
    }
  }
}
