import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  Self,
  Output,
  EventEmitter
} from '@angular/core';
import { TuiHostedDropdownComponent } from '@taiga-ui/core';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SettingsComponent {
  @ViewChild(TuiHostedDropdownComponent) component?: TuiHostedDropdownComponent;

  @Output() handleClose = new EventEmitter<void>();

  public isDefaultComponent: boolean = true;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public template: TemplateRef<unknown>;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  /**
   * Toggles theme.
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  /**
   * Close dropdown with settings.
   */
  public closeSettings(): void {
    this.handleClose.emit();
  }
}
