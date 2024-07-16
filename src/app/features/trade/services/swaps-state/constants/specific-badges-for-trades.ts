import { BadgeInfo } from '@features/trade/models/trade-state';
import {
  BRIDGE_TYPE,
  CrossChainTrade,
  CrossChainTradeType,
  OnChainTrade,
  OnChainTradeType
} from 'rubic-sdk';
import { INFO_COLOR, POSITIVE_COLOR, WARNING_COLOR } from './common/badges-ui';
import {
  showAttentionLabelArbitrumBridge,
  showNoSlippageLabelArbitrumBridge
} from './common/badges-for-providers-conditions';

export const SPECIFIC_BADGES_FOR_PROVIDERS: Partial<
  Record<CrossChainTradeType | OnChainTradeType, BadgeInfo[]>
> = {
  [BRIDGE_TYPE.SYMBIOSIS]: [
    {
      href: 'https://x.com/symbiosis_fi/status/1811374725391888666',
      fromSdk: true,
      getLabel: (trade: CrossChainTrade | OnChainTrade) => {
        const symbolAmount = trade instanceof CrossChainTrade ? trade.promotions?.[0] : null;
        // const [symbol, amount] = symbolAmount.split('_');
        // return `+ ${amount} ${symbol} *`;
        return symbolAmount ? '+5 $Taiko' : '';
      },
      getHint: (trade: CrossChainTrade | OnChainTrade) => {
        const symbolAmount = trade instanceof CrossChainTrade ? trade.promotions?.[0] : null;
        // const [symbol, amount] = symbolAmount.split('_');
        // return `Swap ${SYMBIOSIS_REWARD_PRICE[amount]}+ & get ${amount} ${symbol}!`;
        return symbolAmount ? 'Get up to 5 $Taiko per swap via Symbiosis!' : '';
      },
      showLabel: () => true
    }
  ],
  // [BRIDGE_TYPE.XY]: [
  //   {
  //     href: 'https://twitter.com/xyfinance/status/1788862005736288497',
  //     bgColor: POSITIVE_COLOR,
  //     fromSdk: false,
  //     getLabel: () => 'Get Blast Points!',
  //     showLabel: showXyBlastPromoLabel
  //   }
  // ],
  [BRIDGE_TYPE.MESON]: [
    {
      bgColor: INFO_COLOR,
      fromSdk: false,
      getLabel: () => 'INFO',
      getHint: () => `Meson Provider allows swaps only for amounts with 6 or fewer decimal places. 
      If your transaction amount has more than 6 decimals, only the first 6 digits after the decimal point will be considered during the transaction.
      Example: 0.99999999999 ETH -> 0.999999 ETH`,
      showLabel: () => true
    }
  ],
  [BRIDGE_TYPE.ARBITRUM]: [
    {
      bgColor: POSITIVE_COLOR,
      fromSdk: false,
      getLabel: () => 'NO SLIPPAGE',
      showLabel: showNoSlippageLabelArbitrumBridge
    },
    {
      bgColor: WARNING_COLOR,
      fromSdk: false,
      getLabel: () => 'ATTENTION',
      getHint: () => 'Waiting funds in target chain for 7 days',
      showLabel: showAttentionLabelArbitrumBridge
    }
  ],
  [BRIDGE_TYPE.OWL_TO_BRIDGE]: [
    {
      href: 'https://owlto.finance/',
      bgColor: INFO_COLOR,
      fromSdk: false,
      getLabel: () => '+Points!',
      getHint: () => 'Complete swap using Owlto and recieve Owlto points!',
      showLabel: () => true
    }
  ]
};
