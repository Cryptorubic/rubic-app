import { RecentTradeStatus } from '../models/recent-trade-status.enum';

export const STATUS_BADGE_TEXT: Partial<Record<RecentTradeStatus, string>> = {
  [RecentTradeStatus.FAIL]: 'recentTrades.fail',
  [RecentTradeStatus.PENDING]: 'recentTrades.pending',
  [RecentTradeStatus.SUCCESS]: 'recentTrades.success',
  [RecentTradeStatus.FALLBACK]: 'recentTrades.fallback'
};
