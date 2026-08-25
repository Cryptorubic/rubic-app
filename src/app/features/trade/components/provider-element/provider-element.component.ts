import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { AppFeeInfo, AppGasData, ProviderInfo } from '@features/trade/models/provider-info';
import { TradeInfoManager } from '../../services/trade-info-manager/trade-info-manager.service';
import { isArbitrumBridgeRbcTrade } from '../../utils/is-arbitrum-bridge-rbc-trade';
import { Observable } from 'rxjs';
import { isNearIntentsTrade } from '../../utils/is-near-intents-trade';
import { MaxAmountError, MinAmountError } from '@cryptorubic/web3';
import { HeaderStore } from '@app/core/header/services/header.store';
import BigNumber from 'bignumber.js';
import { isClearswap } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-clearswap';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { isPrivateTrade } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-private-trade';

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

  @Input() hidePrivateBadge = false;

  public expanded = false;

  public get isPrivate(): boolean {
    return isPrivateTrade(this.tradeState);
  }

  public get isShortedMobilePrivate(): boolean {
    return this.shortedInfo && this.isMobile && this.isPrivate;
  }

  public get minMaxErrorAmount(): BigNumber | null {
    const error = this.tradeState?.error;
    if (!error) return null;

    if (error instanceof MinAmountError) {
      return error.minAmount;
    }
    if (error instanceof MaxAmountError) {
      return error.maxAmount;
    }

    return null;
  }

  public get minMaxErrorLabel(): string | null {
    const error = this.tradeState?.error;
    if (!error) return null;

    if (error instanceof MinAmountError) {
      return `min ${error.minAmount} ${error.tokenSymbol}`;
    }
    if (error instanceof MaxAmountError) {
      return `max ${error.maxAmount} ${error.tokenSymbol}`;
    }

    return null;
  }

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly tradeInfoManager: TradeInfoManager,
    private readonly headerStore: HeaderStore
  ) {}

  public toggleExpand(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.expanded = !this.expanded;
  }

  public getAverageTimeString(): string {
    if (isClearswap(this.tradeState.trade.type)) return '3 mins';
    if (isArbitrumBridgeRbcTrade(this.tradeState.trade)) return '7 days';
    if (isNearIntentsTrade(this.tradeState.trade)) return '10+ mins';
    if (this.tradeState.trade instanceof OnChainTrade) {
      return '';
    }
    const time = this.tradeInfoManager.getAverageSwapTimeMinutes(this.tradeState.trade);
    return `${time.averageTimeMins} ${time.averageTimeMins > 1 ? 'mins' : 'min'}`;
  }

  public getTime95PercentsSwapsString(): string {
    if (isArbitrumBridgeRbcTrade(this.tradeState.trade)) return '7 days';
    if (isNearIntentsTrade(this.tradeState.trade)) return '10+ minutes';
    const time = this.tradeInfoManager.getAverageSwapTimeMinutes(this.tradeState.trade);
    return `${time.time95PercentsSwapsMins} ${
      time.time95PercentsSwapsMins > 1 ? 'minutes' : 'minute'
    }`;
  }

  public getProviderInfo(): ProviderInfo {
    return this.tradeInfoManager.getProviderInfo(this.tradeState.trade);
  }

  public getFeeInfo(): AppFeeInfo | null {
    return this.tradeInfoManager.getFeeInfo(this.tradeState.trade);
  }

  public getGasData(): AppGasData | null {
    return this.tradeInfoManager.getGasData(this.tradeState.trade);
  }
}
