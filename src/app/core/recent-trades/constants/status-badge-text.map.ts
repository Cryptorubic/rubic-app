import { RecentTradeStatus } from '../models/recent-trade-status.enum';

export const STATUS_BADGE_TEXT: Partial<Record<RecentTradeStatus, string>> = {
  [RecentTradeStatus.FAIL]: 'Fail',
  [RecentTradeStatus.PENDING]: 'Pending',
  [RecentTradeStatus.SUCCESS]: 'Success',
  [RecentTradeStatus.FALLBACK]: 'Fallback'
};
