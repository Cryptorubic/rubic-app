import { CrossChainTxStatus } from 'rubic-sdk';

export const STATUS_BADGE_TEXT: Partial<Record<CrossChainTxStatus, string>> = {
  [CrossChainTxStatus.FAIL]: 'recentTrades.fail',
  [CrossChainTxStatus.PENDING]: 'recentTrades.pending',
  [CrossChainTxStatus.SUCCESS]: 'recentTrades.success',
  [CrossChainTxStatus.FALLBACK]: 'recentTrades.fallback'
};
