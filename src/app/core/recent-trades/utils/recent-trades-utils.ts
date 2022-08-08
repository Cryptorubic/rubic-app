import { StatusBadgeType } from '@app/shared/components/status-badge/status-badge.component';
import { CrossChainTxStatus } from 'rubic-sdk';
import { STATUS_BADGE_TEXT } from '../constants/status-badge-text.map';
import { STATUS_BADGE_TYPE } from '../constants/status-badge-type.map';

const unknownStatusTranslationKey = 'recentTrades.unknown';

export function getStatusBadgeType(status: CrossChainTxStatus): StatusBadgeType {
  return status ? STATUS_BADGE_TYPE[status] : 'inactive';
}

export function getStatusBadgeText(status: CrossChainTxStatus): string {
  return status ? STATUS_BADGE_TEXT[status] : unknownStatusTranslationKey;
}
