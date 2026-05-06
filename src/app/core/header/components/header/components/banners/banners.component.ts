import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiBanner } from '@app/core/header/models/banners';
import { BannersService } from '@app/core/header/services/banners.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class BannersComponent {
  public readonly banners$ = this.bannersService.banners$;

  public readonly mobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly bannersService: BannersService,
    private readonly gtmService: GoogleTagManagerService
  ) {}

  public getBannerText(banner: ApiBanner, mobile: boolean): string {
    return mobile ? banner.textMobile : banner.text;
  }

  public getButtonText(banner: ApiBanner): string {
    return banner.buttonText ? banner.buttonText : 'Go!';
  }

  public clickOnBanner(banner: ApiBanner, mobile: boolean): void {
    this.gtmService.fireClickOnBannerEvent(this.getBannerText(banner, mobile), banner.linkUrl);
  }
}
