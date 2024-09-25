import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-banner-birthday',
  templateUrl: './banner-birthday.component.html',
  styleUrls: ['./banner-birthday.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerBirthdayComponent {
  @Input() href: string;

  constructor(private googleTagManagerService: GoogleTagManagerService) {}

  public fireClickOnBannerEvent(): void {
    this.googleTagManagerService.fireClickOnBannerEvent('birthday');
  }
}
