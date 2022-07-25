import { StatusBadgeType } from '@app/shared/components/status-badge/status-badge.component';
import { CrossChainTxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TYPE: Partial<Record<CrossChainTxStatus, StatusBadgeType>> = {
  [CrossChainTxStatus.FAIL]: 'error',
  [CrossChainTxStatus.PENDING]: 'info',
  [CrossChainTxStatus.SUCCESS]: 'active',
  [CrossChainTxStatus.FALLBACK]: 'info',
  [CrossChainTxStatus.UNKNOWN]: 'inactive'
};
