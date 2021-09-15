import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  Inject,
  Injector
} from '@angular/core';
import { TuiHostedDropdownComponent } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';
import { takeUntil } from 'rxjs/operators';
import { SettingsComponentData } from 'src/app/core/header/models/settings-component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  @Input() displaySettings = false;

  @ViewChild(TuiHostedDropdownComponent)
  component?: TuiHostedDropdownComponent;

  public isSettingsOpened = false;

  public isDefaultComponent: boolean = true;

  public readonly $isMobile: Observable<boolean>;

  public template: TemplateRef<unknown>;

  public currentComponent$: BehaviorSubject<SettingsComponentData>;

  public defaultComponent: SettingsComponentData;

  private themeSubscription$: Subscription;

  /**
   * @description get current visible component
   * @return currentComponent$
   */
  public get dynamicComponent$(): Observable<SettingsComponentData> {
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
    this.$isMobile = this.headerStore.getMobileDisplayStatus();

    this.currentComponent$.pipe(takeUntil(this.destroy$)).subscribe(({ component }) => {
      this.isDefaultComponent = component === this.defaultComponent.component;
    });
  }

  /**
   * @description toggle theme
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  /**
   * @description switch to default component
   */
  public backToSettings(): void {
    this.currentComponent$.next(this.defaultComponent);
  }

  /**
   * @description close dropdown with settings
   */
  public closeSettings() {
    this.isSettingsOpened = false;
  }
}
