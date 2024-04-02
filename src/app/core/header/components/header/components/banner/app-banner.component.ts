import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-banner',
  templateUrl: './app-banner.component.html',
  styleUrls: ['./app-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {
  @Input() href: string;

  constructor(private googleTagManagerService: GoogleTagManagerService) {}

  public fireClickOnBannerEvent(): void {
    this.googleTagManagerService.fireClickOnBannerEvent('snap');
  }
}
