import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-banner-zk-link',
  templateUrl: './banner-zk-link.component.html',
  styleUrls: ['./banner-zk-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerZkLinkComponent {
  @Input() href: string;

  constructor(private googleTagManagerService: GoogleTagManagerService) {}

  public fireClickOnBannerEvent(): void {
    this.googleTagManagerService.fireClickOnBannerEvent('zklink_point');
  }
}
