import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSwitcherComponent {
  public readonly isDark$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService
  ) {}

  /**
   * Toggles theme on dark or light.
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }
}
