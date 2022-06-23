import { StatusBadgeType } from '@app/shared/components/status-badge/status-badge.component';
import { RecentTradeStatus } from '../models/recent-trade-status.enum';

export const STATUS_BADGE_TYPE: Partial<Record<RecentTradeStatus, StatusBadgeType>> = {
  [RecentTradeStatus.FAIL]: 'error',
  [RecentTradeStatus.PENDING]: 'info',
  [RecentTradeStatus.SUCCESS]: 'active',
  [RecentTradeStatus.FALLBACK]: 'info'
};
