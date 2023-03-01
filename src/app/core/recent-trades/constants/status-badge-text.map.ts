import { ChangenowApiStatus, TxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TEXT: Partial<Record<TxStatus | ChangenowApiStatus, string>> = {
  [TxStatus.FAIL]: 'recentTrades.fail',
  [TxStatus.PENDING]: 'recentTrades.pending',
  [TxStatus.SUCCESS]: 'recentTrades.success',
  [TxStatus.FALLBACK]: 'recentTrades.fallback',
  [TxStatus.UNKNOWN]: 'recentTrades.unknown',

  [ChangenowApiStatus.NEW]: 'recentTrades.new',
  [ChangenowApiStatus.WAITING]: 'recentTrades.waiting',
  [ChangenowApiStatus.CONFIRMING]: 'recentTrades.confirming',
  [ChangenowApiStatus.EXCHANGING]: 'recentTrades.exchanging',
  [ChangenowApiStatus.SENDING]: 'recentTrades.sending',
  [ChangenowApiStatus.FINISHED]: 'recentTrades.finished',
  [ChangenowApiStatus.FAILED]: 'recentTrades.failed',
  [ChangenowApiStatus.REFUNDED]: 'recentTrades.refunded',
  [ChangenowApiStatus.VERIFYING]: 'recentTrades.verifying'
};
