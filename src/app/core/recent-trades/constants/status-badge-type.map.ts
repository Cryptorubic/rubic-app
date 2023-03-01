import { ChangenowApiStatus, TxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TYPE: Partial<Record<TxStatus | ChangenowApiStatus, string>> = {
  [TxStatus.FAIL]: 'error',
  [TxStatus.PENDING]: 'info',
  [TxStatus.SUCCESS]: 'active',
  [TxStatus.FALLBACK]: 'info',
  [TxStatus.UNKNOWN]: 'inactive',

  [ChangenowApiStatus.NEW]: 'info',
  [ChangenowApiStatus.WAITING]: 'info',
  [ChangenowApiStatus.CONFIRMING]: 'info',
  [ChangenowApiStatus.EXCHANGING]: 'info',
  [ChangenowApiStatus.SENDING]: 'info',
  [ChangenowApiStatus.FINISHED]: 'active',
  [ChangenowApiStatus.FAILED]: 'error',
  [ChangenowApiStatus.REFUNDED]: 'info',
  [ChangenowApiStatus.VERIFYING]: 'info'
};
