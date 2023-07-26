import { CHANGENOW_API_STATUS, ChangenowApiStatus, TX_STATUS, TxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TEXT: Partial<Record<TxStatus | ChangenowApiStatus, string>> = {
  [TX_STATUS.FAIL]: 'recentTrades.fail',
  [TX_STATUS.PENDING]: 'recentTrades.pending',
  [TX_STATUS.SUCCESS]: 'recentTrades.success',
  [TX_STATUS.FALLBACK]: 'recentTrades.fallback',
  [TX_STATUS.UNKNOWN]: 'recentTrades.unknown',

  [CHANGENOW_API_STATUS.NEW]: 'recentTrades.waiting',
  [CHANGENOW_API_STATUS.WAITING]: 'recentTrades.waiting',
  [CHANGENOW_API_STATUS.CONFIRMING]: 'recentTrades.confirming',
  [CHANGENOW_API_STATUS.EXCHANGING]: 'recentTrades.exchanging',
  [CHANGENOW_API_STATUS.SENDING]: 'recentTrades.success',
  [CHANGENOW_API_STATUS.FINISHED]: 'recentTrades.success',
  [CHANGENOW_API_STATUS.FAILED]: 'recentTrades.fail',
  [CHANGENOW_API_STATUS.REFUNDED]: 'recentTrades.fallback',
  [CHANGENOW_API_STATUS.VERIFYING]: 'recentTrades.success'
};
