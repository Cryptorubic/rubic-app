import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { FeeInfo } from 'rubic-sdk';

@Component({
  selector: 'app-provider-element',
  templateUrl: './provider-element.component.html',
  styleUrls: ['./provider-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderElementComponent {
  @Input({ required: true }) tradeState: TradeState;

  @Input({ required: true }) toToken: TokenAmount;

  @Input({ required: true }) selectedTradeType: TradeProvider;

  @Input({ required: true }) isBest: boolean = false;

  public expanded = false;

  constructor() {}

  public toggleExpand(event: Event): void {
    event.preventDefault();
    this.expanded = !this.expanded;
  }

  public getPrice(tokenAmount: BigNumber, price: BigNumber): string {
    return tokenAmount.multipliedBy(price).toFixed(2);
  }

  public getProviderInfo(tradeProvider: TradeProvider): ProviderInfo {
    return TRADES_PROVIDERS[tradeProvider];
  }

  public getFeeInfo(): FeeInfo {
    return this.tradeState.trade.getTradeInfo().feeInfo;
  }
}
