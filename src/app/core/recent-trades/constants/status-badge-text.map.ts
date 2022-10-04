import { TxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TEXT: Partial<Record<TxStatus, string>> = {
  [TxStatus.FAIL]: 'recentTrades.fail',
  [TxStatus.PENDING]: 'recentTrades.pending',
  [TxStatus.SUCCESS]: 'recentTrades.success',
  [TxStatus.FALLBACK]: 'recentTrades.fallback',
  [TxStatus.UNKNOWN]: 'recentTrades.unknown'
};
