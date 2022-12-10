import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';

export function isOnramperRecentTrade(
  recentTrade: RecentTrade
): recentTrade is OnramperRecentTrade {
  return recentTrade && 'txId' in recentTrade;
}
