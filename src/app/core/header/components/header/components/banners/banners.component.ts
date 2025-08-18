import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiBanner } from '@app/core/header/models/banners';
import { BannersService } from '@app/core/header/services/banners.service';
import { HeaderStore } from '@app/core/header/services/header.store';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannersComponent {
  public readonly banners$ = this.bannersService.banners$;

  public readonly mobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly bannersService: BannersService
  ) {}

  public getBannerText(banner: ApiBanner, mobile: boolean): string {
    return mobile ? banner.textMobile : banner.text;
  }

  public getButtonText(banner: ApiBanner): string {
    return banner.buttonText ? banner.buttonText : 'Go!';
  }
}
