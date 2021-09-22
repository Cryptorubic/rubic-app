import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSwitcherComponent {
  public readonly isDark$: Observable<boolean>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService
  ) {
    this.isDark$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));
  }

  /**
   * Toggles theme on dark or light.
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }
}
