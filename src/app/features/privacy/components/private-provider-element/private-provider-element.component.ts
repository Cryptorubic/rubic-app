import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateProviderInfoUI } from '../../models/provider-info';
import { PrivateTradeType } from '../../constants/private-trade-types';
import {
  PrivateProviderMetricTypeEvent,
  PRIVATE_TRADE_TYPE_TO_PROVIDER_NAME_EVENT,
  PRIVATE_TAB_TO_FLOW_TYPE_EVENT
} from '@core/services/google-tag-manager/models/google-tag-manager';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { PrivacyMainPageService } from '../../services/privacy-main-page.service';

@Component({
  selector: 'app-private-provider-element',
  templateUrl: './private-provider-element.component.html',
  styleUrls: ['./private-provider-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PrivateProviderElementComponent {
  @Input({ required: true }) providerInfo: PrivateProviderInfoUI;

  @Output() providerSelected: EventEmitter<PrivateTradeType> = new EventEmitter();

  public readonly starsCount = Array.from({ length: 4 }, (_, i) => i + 1);

  public readonly feeRateCount = Array.from({ length: 3 }, (_, i) => i + 1);

  public readonly executionTimeCount = Array.from({ length: 3 }, (_, i) => i + 1);

  constructor(
    private readonly gtmService: GoogleTagManagerService,
    private readonly privacyMainPageService: PrivacyMainPageService
  ) {}

  public handleClick(): void {
    this.providerSelected.emit(this.providerInfo.name);
  }

  public handleMetricTooltipHover(metricType: PrivateProviderMetricTypeEvent): void {
    this.gtmService.fireViewProviderMetricTooltipEvent(
      PRIVATE_TAB_TO_FLOW_TYPE_EVENT[this.privacyMainPageService.selectedTab],
      PRIVATE_TRADE_TYPE_TO_PROVIDER_NAME_EVENT[this.providerInfo.name],
      metricType
    );
  }

  public getSecurityOffset(count: number): number {
    if (count < this.providerInfo.security) return 0;

    const offset = this.providerInfo.security % 1;
    return offset ? (1 - offset) * 100 : 0;
  }
}
