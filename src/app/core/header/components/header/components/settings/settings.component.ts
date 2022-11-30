import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  TemplateRef,
  Inject,
  Injector
} from '@angular/core';
import { TuiHostedDropdownComponent } from '@taiga-ui/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';
import { map } from 'rxjs/operators';
import { SettingsComponentData } from 'src/app/core/header/models/settings-component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  @Input() displaySettings = false;

  @ViewChild(TuiHostedDropdownComponent) component?: TuiHostedDropdownComponent;

  public isSettingsOpened = false;

  public template: TemplateRef<unknown>;

  private readonly defaultComponent = {
    titleKey: 'Settings',
    component: new PolymorpheusComponent(SettingsListComponent)
  };

  private readonly _currentComponent$ = new BehaviorSubject(this.defaultComponent);

  public readonly isDefaultComponent$ = this.dynamicComponent$.pipe(
    map(component => component.titleKey === this.defaultComponent.titleKey)
  );

  /**
   * Gets current visible component.
   * @return currentComponent$
   */
  public get dynamicComponent$(): Observable<SettingsComponentData> {
    return this._currentComponent$.asObservable();
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    @Inject(Injector) public readonly injector: Injector
  ) {}

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
    this._currentComponent$.next(this.defaultComponent);
  }

  /**
   * Close dropdown with settings.
   */
  public closeSettings(): void {
    this.isSettingsOpened = false;
  }
}
