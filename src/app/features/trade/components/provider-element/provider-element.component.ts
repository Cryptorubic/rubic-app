import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { AppFeeInfo, AppGasData, ProviderInfo } from '@features/trade/models/provider-info';
import { TradeInfoManager } from '../../services/trade-info-manager/trade-info-manager.service';
import { isArbitrumBridgeRbcTrade } from '../../utils/is-arbitrum-bridge-rbc-trade';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-provider-element',
  templateUrl: './provider-element.component.html',
  styleUrls: ['./provider-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderElementComponent {
  @Input({ required: true }) tradeState: TradeState;

  @Input({ required: true }) selectedTradeType: TradeProvider;

  @Input({ required: true }) isBest: boolean = false;

  @Input({ required: true }) shortedInfo: boolean = false;

  @Input({ required: true }) hideHint$: Observable<boolean>;

  public expanded = false;

  constructor(private readonly tradeInfoManager: TradeInfoManager) {}

  public toggleExpand(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.expanded = !this.expanded;
  }

  public getAverageTimeString(): string {
    if (isArbitrumBridgeRbcTrade(this.tradeState.trade)) {
      return '7 D';
    }

    const info = this.getProviderInfo(this.tradeState.tradeType);
    const time = `${info?.averageTime || 3} M`;

    return time;
  }

  public getProviderInfo(tradeProvider: TradeProvider): ProviderInfo {
    return this.tradeInfoManager.getProviderInfo(tradeProvider);
  }

  public getFeeInfo(): AppFeeInfo {
    return this.tradeInfoManager.getFeeInfo(this.tradeState.trade);
  }

  public getGasData(): AppGasData | null {
    return this.tradeInfoManager.getGasData(this.tradeState.trade);
  }
}
