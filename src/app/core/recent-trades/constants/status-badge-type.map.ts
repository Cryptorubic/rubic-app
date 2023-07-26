import { CHANGENOW_API_STATUS, ChangenowApiStatus, TX_STATUS, TxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TYPE: Partial<Record<TxStatus | ChangenowApiStatus, string>> = {
  [TX_STATUS.FAIL]: 'error',
  [TX_STATUS.PENDING]: 'info',
  [TX_STATUS.SUCCESS]: 'active',
  [TX_STATUS.FALLBACK]: 'info',
  [TX_STATUS.UNKNOWN]: 'inactive',

  [CHANGENOW_API_STATUS.NEW]: 'info',
  [CHANGENOW_API_STATUS.WAITING]: 'info',
  [CHANGENOW_API_STATUS.CONFIRMING]: 'info',
  [CHANGENOW_API_STATUS.EXCHANGING]: 'info',
  [CHANGENOW_API_STATUS.SENDING]: 'active',
  [CHANGENOW_API_STATUS.FINISHED]: 'active',
  [CHANGENOW_API_STATUS.FAILED]: 'error',
  [CHANGENOW_API_STATUS.REFUNDED]: 'info',
  [CHANGENOW_API_STATUS.VERIFYING]: 'info'
};
