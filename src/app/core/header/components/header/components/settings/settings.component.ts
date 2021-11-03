import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  TemplateRef,
  Inject,
  Injector,
  OnInit
} from '@angular/core';
import { TuiHostedDropdownComponent } from '@taiga-ui/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
export class SettingsComponent implements OnInit {
  @Input() displaySettings = false;

  @ViewChild(TuiHostedDropdownComponent)
  component?: TuiHostedDropdownComponent;

  public isSettingsOpened = false;

  public isDefaultComponent: boolean = true;

  public readonly isMobile$: Observable<boolean>;

  public template: TemplateRef<unknown>;

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public currentComponent$: BehaviorSubject<SettingsComponentData>;

  public defaultComponent: SettingsComponentData;

  /**
   * Gets current visible component.
   * @return currentComponent$
   */
  public get dynamicComponent$(): Observable<SettingsComponentData> {
    return this.currentComponent$.asObservable();
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly destroy$: TuiDestroyService,
    @Inject(Injector) public readonly injector: Injector
  ) {
    this.defaultComponent = {
      titleKey: 'Settings',
      component: new PolymorpheusComponent(SettingsListComponent)
    };
    this.currentComponent$ = new BehaviorSubject(this.defaultComponent);
    this.isMobile$ = this.headerStore.getMobileDisplayStatus();
  }

  public ngOnInit(): void {
    this.currentComponent$.pipe(takeUntil(this.destroy$)).subscribe(({ titleKey }) => {
      this.isDefaultComponent = titleKey === this.defaultComponent.titleKey;
    });
  }

  /**
   * Toggles theme.
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  /**
   * Switches to default component.
   */
  public backToSettings(): void {
    this.currentComponent$.next(this.defaultComponent);
  }

  /**
   * Close dropdown with settings.
   */
  public closeSettings() {
    this.isSettingsOpened = false;
  }
}
