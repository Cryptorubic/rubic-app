import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-banner-taiko',
  templateUrl: './banner-taiko.component.html',
  styleUrls: ['./banner-taiko.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerTaikoComponent {
  @Input() href: string;

  constructor(private googleTagManagerService: GoogleTagManagerService) {}

  public fireClickOnBannerEvent(): void {
    this.googleTagManagerService.fireClickOnBannerEvent('taiko_point');
  }
}
