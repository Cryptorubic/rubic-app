import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { CrossChainTradeType, OnChainTradeType, RubicStep } from 'rubic-sdk';
import { ON_CHAIN_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/on-chain-providers';
import { BRIDGE_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/bridge-providers';

interface ProviderStep {
  provider: {
    label: string;
    image: string;
  };
  amounts: string[];
}

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

  public readonly time: string = '3 Min';

  public readonly providerFee: BigNumber = new BigNumber('0.14159');

  public readonly gasFee: BigNumber = new BigNumber('3.44159');

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

  public getSteps(routes: RubicStep[]): ProviderStep[] {
    return routes.map(route => {
      if (route.type === 'on-chain') {
        const provider = ON_CHAIN_PROVIDERS[route.provider as OnChainTradeType];
        return {
          provider: {
            label: `Swap Via ${provider.name}`,
            image: provider.image
          },
          amounts: route.path.map(el => el.symbol)
        };
      }
      const provider = BRIDGE_PROVIDERS[route.provider as CrossChainTradeType];
      return {
        provider: {
          label: `Bridge Via ${provider.name}`,
          image: provider.image
        },
        amounts: route.path.map(el => {
          const tokenAmountString =
            'tokenAmount' in el && el.tokenAmount.gt(0) ? el.tokenAmount.toFixed() + ' ' : '';
          return `${tokenAmountString}${el.symbol}`;
        })
      };
    });
  }
}
