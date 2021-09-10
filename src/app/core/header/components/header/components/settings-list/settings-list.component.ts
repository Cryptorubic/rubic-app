import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { ThemeService } from 'src/app/core/services/theme/theme.service';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsListComponent {
  public readonly $isMobile: Observable<boolean>;

  private themeSubscription$: Subscription;

  @Output() type = new EventEmitter<string>();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
  }

  public switchTheme(): void {
    this.themeService.switchTheme();
  }

  public navigateExternalLink(url: string): void {
    window.open(url, '_blank');
  }
}
