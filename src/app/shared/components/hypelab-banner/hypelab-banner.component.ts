import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';

@Component({
  selector: 'app-hypelab-banner',
  templateUrl: './hypelab-banner.component.html',
  styleUrls: ['./hypelab-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HypelabBannerComponent {
  private readonly isMobile = this.headerStore.isMobile;

  public get iframeUrl(): string {
    return `assets/hype-lab-banner/index.html/?placement=${
      this.isMobile ? 'a74ae05143' : '1ea374aff0'
    }&isMobile=${this.isMobile}`;
  }

  constructor(private readonly headerStore: HeaderStore) {}
}
