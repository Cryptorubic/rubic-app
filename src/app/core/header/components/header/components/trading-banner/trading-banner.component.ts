import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { TokenPair } from '@core/header/components/header/components/trading-banner/models/token-pair';
import { bannerTokens } from '@core/header/components/header/components/trading-banner/constants/banner-tokens';

@Component({
  selector: 'app-trading-banner',
  templateUrl: './trading-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradingBannerComponent {
  @Output() handleLinkClick: EventEmitter<TokenPair> = new EventEmitter();

  /**
   * Banner type. Component Renders different texts based on type.
   */
  @Input() type: 'default' | 'custom' = 'default';

  public readonly bannerTokens = bannerTokens;
}
