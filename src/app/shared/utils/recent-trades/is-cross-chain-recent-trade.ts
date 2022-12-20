import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { CrossChainRecentTrade } from '@shared/models/recent-trades/cross-chain-recent-trade';

export function isCrossChainRecentTrade(
  recentTrade: RecentTrade
): recentTrade is CrossChainRecentTrade {
  return recentTrade && 'crossChainTradeType' in recentTrade;
}
