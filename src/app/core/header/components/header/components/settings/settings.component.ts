import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
  Self,
  Output,
  EventEmitter
} from '@angular/core';
import { TuiHostedDropdownComponent } from '@taiga-ui/core';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SettingsComponent implements OnInit {
  @ViewChild(TuiHostedDropdownComponent) component?: TuiHostedDropdownComponent;

  @Output() handleClose = new EventEmitter<void>();

  public isDefaultComponent: boolean = true;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public template: TemplateRef<unknown>;

  public defaultComponent = {
    titleKey: 'Settings',
    component: new PolymorpheusComponent(SettingsListComponent)
  };

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly _currentComponent$ = new BehaviorSubject(this.defaultComponent);

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this._currentComponent$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ titleKey }) => {
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
    this._currentComponent$.next(this.defaultComponent);
  }

  /**
   * Close dropdown with settings.
   */
  public closeSettings(): void {
    this.handleClose.emit();
  }
}
