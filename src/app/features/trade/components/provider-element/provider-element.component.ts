import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { AppFeeInfo, AppGasData, ProviderInfo } from '@features/trade/models/provider-info';
import { TradeInfoManager } from '../../services/trade-info-manager/trade-info-manager.service';
import { isArbitrumBridgeRbcTrade } from '../../utils/is-arbitrum-bridge-rbc-trade';
import { Observable } from 'rxjs';
import { isNearIntentsTrade } from '../../utils/is-near-intents-trade';
import { ON_CHAIN_TRADE_TYPE } from '@cryptorubic/core';
import { TRADES_PROVIDERS } from '@features/trade/constants/trades-providers';
import { MaxAmountError, MinAmountError } from '@cryptorubic/web3';

@Component({
  standalone: false,
  selector: 'app-provider-element',
  templateUrl: './provider-element.component.html',
  styleUrls: ['./provider-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderElementComponent {
  @Input({ required: true }) tradeState!: TradeState;

  @Input({ required: true }) selectedTradeType!: TradeProvider;

  @Input({ required: true }) isBest: boolean = false;

  @Input({ required: true }) shortedInfo: boolean = false;

  @Input({ required: true }) hideHint$!: Observable<boolean>;

  public expanded = false;

  public get isClearswap(): boolean {
    return this.tradeState?.tradeType === ON_CHAIN_TRADE_TYPE.CLEARSWAP;
  }

  public get minMaxErrorLabel(): string | null {
    const error = this.tradeState?.error;
    if (!error || !(error instanceof MinAmountError || error instanceof MaxAmountError))
      return null;

    if (error instanceof MinAmountError) {
      return `min ${error.minAmount} ${error.tokenSymbol}`;
    }
    if (error instanceof MaxAmountError) {
      return `max ${error.maxAmount} ${error.tokenSymbol}`;
    }

    return null;
  }

  constructor(private readonly tradeInfoManager: TradeInfoManager) {}

  public toggleExpand(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.expanded = !this.expanded;
  }

  public getAverageTimeString(): string {
    if (this.tradeState?.tradeType === ON_CHAIN_TRADE_TYPE.CLEARSWAP) return '3 mins';

    const trade = this.tradeState?.trade;
    if (!trade) return '—';

    if (isArbitrumBridgeRbcTrade(trade)) return '7 days';
    if (isNearIntentsTrade(trade)) return '10+ mins';
    const time = this.tradeInfoManager.getAverageSwapTimeMinutes(trade);
    return `${time.averageTimeMins} ${time.averageTimeMins > 1 ? 'mins' : 'min'}`;
  }

  public getTime95PercentsSwapsString(): string {
    const trade = this.tradeState?.trade;
    if (!trade) return '—';

    if (isArbitrumBridgeRbcTrade(trade)) return '7 days';
    if (isNearIntentsTrade(trade)) return '10+ minutes';
    const time = this.tradeInfoManager.getAverageSwapTimeMinutes(trade);
    return `${time.time95PercentsSwapsMins} ${
      time.time95PercentsSwapsMins > 1 ? 'minutes' : 'minute'
    }`;
  }

  public getProviderInfo(): ProviderInfo {
    if (!this.tradeState?.trade) {
      return {
        ...(TRADES_PROVIDERS[this.tradeState.tradeType] ?? { name: '', image: '', color: '' })
      };
    }

    return this.tradeInfoManager.getProviderInfo(this.tradeState.trade);
  }

  public getFeeInfo(): AppFeeInfo | null {
    if (!this.tradeState?.trade) {
      return null;
    }
    return this.tradeInfoManager.getFeeInfo(this.tradeState.trade);
  }

  public getGasData(): AppGasData | null {
    if (!this.tradeState?.trade) return null;
    return this.tradeInfoManager.getGasData(this.tradeState.trade);
  }
}
