import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import {
  CrossChainTradeType,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  FeeInfo,
  nativeTokensList,
  Web3Pure
} from 'rubic-sdk';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';

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

  constructor(private readonly platformConfigurationService: PlatformConfigurationService) {}

  public toggleExpand(event: Event): void {
    event.preventDefault();
    this.expanded = !this.expanded;
  }

  public getPrice(tokenAmount: BigNumber, price: BigNumber): string {
    return tokenAmount.multipliedBy(price).toFixed(2);
  }

  public getProviderInfo(tradeProvider: TradeProvider): ProviderInfo {
    const provider = TRADES_PROVIDERS[tradeProvider];
    const providerAverageTime = this.platformConfigurationService.providersAverageTime;
    const currentProviderTime = providerAverageTime?.[tradeProvider as CrossChainTradeType];

    return {
      ...provider,
      averageTime: currentProviderTime ? currentProviderTime : provider.averageTime
    };
  }

  public getFeeInfo(): FeeInfo {
    return this.tradeState.trade.getTradeInfo().feeInfo;
  }

  public getGasData(): { amount: BigNumber; symbol: string } | null {
    const trade = this.tradeState.trade;
    let gasData = null;
    if (trade instanceof EvmCrossChainTrade) {
      gasData = trade.gasData;
    } else if (trade instanceof EvmOnChainTrade) {
      gasData = trade.gasFeeInfo;
    }

    if (!gasData || !gasData.gasLimit) {
      return null;
    }
    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const gasLimit = gasData.gasLimit.multipliedBy(gasData.gasPrice);

    return {
      amount: Web3Pure.fromWei(gasLimit, trade.from.decimals),
      symbol: nativeToken.symbol
    };
  }
}
