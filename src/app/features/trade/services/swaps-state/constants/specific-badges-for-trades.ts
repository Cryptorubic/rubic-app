import { BadgeInfo } from '@features/trade/models/trade-state';
import {
  BLOCKCHAIN_NAME,
  BRIDGE_TYPE,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTrade,
  CrossChainTradeType,
  OnChainTrade
} from 'rubic-sdk';

function showNoSlippageLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return trade.from.symbol.toLowerCase() === 'rbc' && trade.to.symbol.toLowerCase() === 'rbc';
}

function showAttentionLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return (
    trade.type === CROSS_CHAIN_TRADE_TYPE.ARBITRUM &&
    trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM &&
    trade.to.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  );
}

const positiveBadgeColor =
  'linear-gradient(90deg, rgba(0, 255, 117, 0.6) 0%, rgba(224, 255, 32, 0.6) 99.18%)';
const warningBadgeColor =
  'linear-gradient(90deg, rgba(204, 141, 23, 0.83) 0%, rgba(213, 185, 5, 0.94) 99.18%)';
export const SYMBIOSIS_REWARD_PRICE: { [key: string]: string } = {
  '1.2': '$50',
  '1.5': '$250',
  '2.5': '$1000',
  '5': '$2.500',
  '6.5': '$10.000'
};

export const SPECIFIC_BADGES: Partial<Record<CrossChainTradeType, BadgeInfo[]>> = {
  [BRIDGE_TYPE.SYMBIOSIS]: [
    {
      hint: 'Swap $100+ & get up to 1.3 $MNT!',
      label: '+ 1.3 MNT *',
      href: 'https://twitter.com/symbiosis_fi/status/1785996599564382501',
      fromSdk: false,
      showLabel: () => true
    }
  ],
  [BRIDGE_TYPE.XY]: [
    {
      label: 'Get Blast Points!',
      fromSdk: true,
      bgColor: positiveBadgeColor,
      href: 'https://twitter.com/xyfinance/status/1788862005736288497',
      showLabel: () => true
    }
  ],
  [BRIDGE_TYPE.ARBITRUM]: [
    {
      label: 'NO SLIPPAGE',
      bgColor: positiveBadgeColor,
      fromSdk: false,
      showLabel: showNoSlippageLabelArbitrumBridge
    },
    {
      label: 'ATTENTION',
      hint: 'Waiting funds in target chain for 7 days',
      bgColor: warningBadgeColor,
      fromSdk: false,
      showLabel: showAttentionLabelArbitrumBridge
    }
  ]
};
