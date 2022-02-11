import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from '@core/services/theme/theme.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-referral-banner',
  templateUrl: './app-referral-banner.component.html',
  styleUrls: ['./app-referral-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppReferralBannerComponent {
  @Input() href: string;

  public readonly isDark$: Observable<boolean>;

  constructor(private readonly themeService: ThemeService) {
    this.isDark$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));
  }
}
