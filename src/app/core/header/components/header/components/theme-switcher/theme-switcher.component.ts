import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { map } from 'rxjs/operators';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSwitcherComponent {
  public readonly isDark$: Observable<boolean>;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    private readonly headerStore: HeaderStore
  ) {
    this.isDark$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));
  }

  /**
   * Toggles theme on dark or light.
   * @deprecated
   */
  public switchTheme(): void {
    // this.themeService.switchTheme();
  }
}
