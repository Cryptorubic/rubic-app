import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  BridgeType,
  CrossChainTradeType,
  ON_CHAIN_TRADE_TYPE,
  OnChainTradeType,
  RubicStep
} from 'rubic-sdk';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { ShortenAmountPipe } from '@shared/pipes/shorten-amount.pipe';
import { BRIDGE_PROVIDERS } from '@features/trade/constants/bridge-providers';
import { ON_CHAIN_PROVIDERS } from '@features/trade/constants/on-chain-providers';
import { ProviderInfo } from '../../models/provider-info';

interface ProviderStep {
  provider: {
    label: string;
    image: string;
  };
  amounts: string[];
}

const BRIDGE_TO_ONCHAIN_KEY: Partial<Record<BridgeType, OnChainTradeType>> = {
  rango: ON_CHAIN_TRADE_TYPE.RANGO,
  symbiosis: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
  lifi: ON_CHAIN_TRADE_TYPE.LIFI,
  xy: ON_CHAIN_TRADE_TYPE.XY_DEX
};

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
          ON_CHAIN_PROVIDERS[route.provider] ||
          ON_CHAIN_PROVIDERS[BRIDGE_TO_ONCHAIN_KEY[this.tradeType as BridgeType]] ||
          this.getUnknownDex();

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
      name: 'unknown dex',
      color: 'white',
      image: 'assets/images/icons/coins/default-token-ico.svg'
    };
  }
}
