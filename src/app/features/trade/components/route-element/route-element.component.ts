import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  selector: 'app-route-element',
  templateUrl: './route-element.component.html',
  styleUrls: ['./route-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteElementComponent {
  public steps: ProviderStep[] = [];

  @Input({ required: true }) set routes(steps: RubicStep[]) {
    this.steps = this.getSteps(steps);
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
