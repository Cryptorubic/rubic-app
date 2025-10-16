import { BadgeInfo } from '@features/trade/models/trade-state';
import {
  BRIDGE_TYPE,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTrade,
  CrossChainTradeType,
  ON_CHAIN_TRADE_TYPE,
  OnChainTrade,
  OnChainTradeType
} from '@cryptorubic/sdk';
import { INFO_COLOR, PINK_COLOR, POSITIVE_COLOR, WARNING_COLOR } from './common/badges-ui';
import {
  showAttentionLabelArbitrumBridge,
  showBerachainLabel,
  showNoSlippageLabelArbitrumBridge
} from './common/badges-for-providers-conditions';

export const SPECIFIC_BADGES_FOR_PROVIDERS: Partial<
  Record<CrossChainTradeType | OnChainTradeType, BadgeInfo[]>
> = {
  [CROSS_CHAIN_TRADE_TYPE.OWL_TO_BRIDGE]: [
    {
      fromSdk: false,
      getUrl: () => 'https://owlto.finance/',
      getBgColor: () => INFO_COLOR,
      getLabel: () => '+Points!',
      getHint: () => 'Complete swap using Owlto and recieve Owlto points!',
      showLabel: () => true
    }
  ],
  [ON_CHAIN_TRADE_TYPE.ODOS]: [
    {
      fromSdk: false,
      getUrl: () => 'https://x.com/odosdao/status/1869962497694036358',
      getBgColor: () => '#FF510199',
      getLabel: () => '+Points!',
      getHint: () => 'Complete swap using Odos and recieve Odos points!',
      showLabel: () => true
    }
  ],
  [BRIDGE_TYPE.SYMBIOSIS]: [
    {
      fromSdk: true,
      getUrl: (trade: CrossChainTrade | OnChainTrade) => {
        const symbolAmount = trade instanceof CrossChainTrade ? trade.promotions?.[0] : null;
        const [symbol] = symbolAmount.split('_');
        if (symbol.toLowerCase() === 'taiko') {
          return 'https://x.com/symbiosis_fi/status/1811374725391888666';
        }
        if (symbol.toLowerCase() === 'arb') {
          return 'https://symbiosis.finance/blog/earn-arb-arbitrum-incentives-at-symbiosis#how-much-arb-rewards-can-you-earn';
        }
        return '';
      },
      getLabel: (trade: CrossChainTrade | OnChainTrade) => {
        const symbolAmount = trade instanceof CrossChainTrade ? trade.promotions?.[0] : null;
        const [symbol] = symbolAmount.split('_');
        if (symbol.toLowerCase() === 'taiko') {
          return '+5 $Taiko';
        }
        if (symbol.toLowerCase() === 'arb') {
          return '+ARB';
        }
        return '';
      },
      getHint: (trade: CrossChainTrade | OnChainTrade) => {
        const symbolAmount = trade instanceof CrossChainTrade ? trade.promotions?.[0] : null;
        const [symbol] = symbolAmount.split('_');
        if (symbol.toLowerCase() === 'taiko') {
          return 'Get up to 5 $Taiko per swap via Symbiosis!';
        }
        if (symbol.toLowerCase() === 'arb') {
          return 'Earn ARB Arbitrum Incentives at Symbiosis';
        }
        return '';
      },
      showLabel: () => true
    }
  ],
  [BRIDGE_TYPE.MESON]: [
    {
      fromSdk: false,
      getBgColor: () => INFO_COLOR,
      getLabel: () => 'INFO',
      getHint: () => `Meson Provider allows swaps only for amounts with 6 or fewer decimal places. 
      If your transaction amount has more than 6 decimals, only the first 6 digits after the decimal point will be considered during the transaction.
      Example: 0.99999999999 ETH -> 0.999999 ETH`,
      showLabel: () => true
    }
  ],
  [BRIDGE_TYPE.ARBITRUM]: [
    {
      fromSdk: false,
      getBgColor: () => POSITIVE_COLOR,
      getLabel: () => 'NO SLIPPAGE',
      showLabel: showNoSlippageLabelArbitrumBridge
    },
    {
      fromSdk: false,
      getBgColor: () => WARNING_COLOR,
      getLabel: () => 'ATTENTION',
      getHint: () => 'Waiting funds in target chain for 7 days',
      showLabel: showAttentionLabelArbitrumBridge
    }
  ],
  [CROSS_CHAIN_TRADE_TYPE.WANCHAIN_BRIDGE]: [],
  [CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE]: [
    {
      fromSdk: false,
      getBgColor: () => PINK_COLOR,
      getLabel: () => 'Reward',
      getUrl: () => 'https://www.orbiter.finance/quest/41',
      showLabel: showBerachainLabel
    }
  ],
  [CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE_V2]: [
    {
      fromSdk: false,
      getBgColor: () => PINK_COLOR,
      getLabel: () => 'Reward',
      getUrl: () => 'https://www.orbiter.finance/quest/41',
      showLabel: showBerachainLabel
    }
  ]
};
