import { TxStatus } from 'rubic-sdk';
import { STATUS_BADGE_TEXT } from '../constants/status-badge-text.map';
import { STATUS_BADGE_TYPE } from '../constants/status-badge-type.map';

const unknownStatusTranslationKey = 'recentTrades.unknown';

export function getStatusBadgeType(status: TxStatus): string {
  return status ? STATUS_BADGE_TYPE[status] : 'inactive';
}

export function getStatusBadgeText(status: TxStatus): string {
  return status ? STATUS_BADGE_TEXT[status] : unknownStatusTranslationKey;
}
