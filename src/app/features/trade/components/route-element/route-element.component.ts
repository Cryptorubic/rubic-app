import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CrossChainTradeType, OnChainTradeType } from '@cryptorubic/core';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { ShortenAmountPipe } from '@shared/pipes/shorten-amount.pipe';
import { BRIDGE_PROVIDERS } from '@features/trade/constants/bridge-providers';
import { ON_CHAIN_PROVIDERS } from '@features/trade/constants/on-chain-providers';
import { ProviderInfo } from '../../models/provider-info';
import { BridgeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { RubicStep } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

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

  @Input({ required: true }) tradeType: BridgeType | OnChainTradeType;

  @Input({ required: true })
  set routes(steps: RubicStep[]) {
    this.steps = this.getSteps(steps);
  }

  public getSteps(routes: RubicStep[]): ProviderStep[] {
    return routes.map(route => {
      if (route.type === 'on-chain') {
        const provider =
          ON_CHAIN_PROVIDERS[route.provider as OnChainTradeType] || this.getUnknownDex();

        return {
          provider: {
            label: `Swap Via ${provider.name}`,
            image: provider.image
          },
          amounts: route.path.map(el => el.symbol)
        };
      }
      const provider = BRIDGE_PROVIDERS[route.provider as CrossChainTradeType];
      const bnFormat = new BigNumberFormatPipe();
      const amountFormat = new ShortenAmountPipe();

      return {
        provider: {
          label: `Bridge Via ${provider.name}`,
          image: provider.image
        },
        amounts: route.path.map(el => {
          const tokenAmountString =
            'tokenAmount' in el && el.tokenAmount.gt(0)
              ? amountFormat.transform(bnFormat.transform(el.tokenAmount), 8, 6) + ' '
              : '';
          return `${tokenAmountString}${el.symbol}`;
        })
      };
    });
  }

  private getUnknownDex(): ProviderInfo {
    return {
      name: 'Unknown dex',
      color: 'white',
      image: 'assets/images/icons/unknown.svg'
    };
  }
}
