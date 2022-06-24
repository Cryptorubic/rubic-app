import { StatusBadgeType } from '@app/shared/components/status-badge/status-badge.component';
import { STATUS_BADGE_TEXT } from '../constants/status-badge-text.map';
import { STATUS_BADGE_TYPE } from '../constants/status-badge-type.map';
import { RecentTradeStatus } from '../models/recent-trade-status.enum';

const unknownStatusTranslationKey = 'recentTrades.unknown';

export function getStatusBadgeType(status: RecentTradeStatus): StatusBadgeType {
  return status ? STATUS_BADGE_TYPE[status] : 'inactive';
}

export function getStatusBadgeText(status: RecentTradeStatus): string {
  return status ? STATUS_BADGE_TEXT[status] : unknownStatusTranslationKey;
}
