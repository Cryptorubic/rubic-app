import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PromotionType, TradeState } from '@features/trade/models/trade-state';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { AppFeeInfo, AppGasData, ProviderInfo } from '@features/trade/models/provider-info';
import { TradeInfoManager } from '../../services/trade-info-manager/trade-info-manager.service';

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

  public expanded = false;

  public symbiosisMantlePromoData: PromotionType = {
    hint: 'Swap $100+ & get up to 1.3 $MNT!',
    label: '+ 1.3 MNT *',
    href: 'https://x.com/symbiosis_fi/status/1775894610101096816'
  };

  constructor(private readonly tradeInfoManager: TradeInfoManager) {}

  public toggleExpand(event: Event): void {
    event.preventDefault();
    this.expanded = !this.expanded;
  }

  public getProviderInfo(tradeType: TradeProvider): ProviderInfo {
    return this.tradeInfoManager.getProviderInfo(tradeType);
  }

  public getFeeInfo(): AppFeeInfo {
    return this.tradeInfoManager.getFeeInfo(this.tradeState.trade);
  }

  public getGasData(): AppGasData | null {
    return this.tradeInfoManager.getGasData(this.tradeState.trade);
  }
}
