import { CrossChainTxStatusConfig } from '@app/core/services/sdk/sdk-legacy/features/ws-api/models/cross-chain-tx-status-config';

export const CROSS_CHAIN_DEPOSIT_STATUS = {
  WAITING: 'waiting',
  CONFIRMING: 'confirming',
  EXCHANGING: 'exchanging',
  SENDING: 'sending',
  FINISHED: 'finished',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
  VERIFYING: 'verifying',
  NEW: 'new'
} as const;

export type CrossChainDepositStatus =
  (typeof CROSS_CHAIN_DEPOSIT_STATUS)[keyof typeof CROSS_CHAIN_DEPOSIT_STATUS];

export interface CrossChainDepositData {
  status: CrossChainDepositStatus;
  dstHash: string | null;
}

export const API_STATUS_TO_DEPOSIT_STATUS: Record<
  CrossChainTxStatusConfig['status'],
  CrossChainDepositStatus
> = {
  FAIL: CROSS_CHAIN_DEPOSIT_STATUS.FAILED,
  PENDING: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
  SUCCESS: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
  // only for rbc bridge. Doesn't exist in deposit trades
  READY_TO_CLAIM: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
  REVERT: CROSS_CHAIN_DEPOSIT_STATUS.REFUNDED,
  REVERTED: CROSS_CHAIN_DEPOSIT_STATUS.REFUNDED,
  LONG_PENDING: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
  NOT_FOUND: CROSS_CHAIN_DEPOSIT_STATUS.WAITING
};
