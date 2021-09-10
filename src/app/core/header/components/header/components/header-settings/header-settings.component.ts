import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { Observable, Subscription } from 'rxjs';
import { ThemeService } from 'src/app/core/services/theme/theme.service';

@Component({
  selector: 'app-header-settings',
  templateUrl: './header-settings.component.html',
  styleUrls: ['./header-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSettingsComponent {
  public readonly $isMobile: Observable<boolean>;

  private themeSubscription$: Subscription;

  public type = 'settings';

  @Input() public opened = false;

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
}
