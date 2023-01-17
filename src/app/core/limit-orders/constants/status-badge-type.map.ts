import { TxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TYPE: Partial<Record<TxStatus, string>> = {
  [TxStatus.FAIL]: 'error',
  [TxStatus.PENDING]: 'info',
  [TxStatus.SUCCESS]: 'active',
  [TxStatus.FALLBACK]: 'info',
  [TxStatus.UNKNOWN]: 'inactive'
};
