import { TransactionStatus } from '@shared/models/blockchain/transaction-status';

export const TRANSLATION_STATUS_KEY = {
  [TransactionStatus.COMPLETED]: 'tradesTable.statuses.completed',
  [TransactionStatus.PENDING]: 'tradesTable.statuses.pending',
  [TransactionStatus.CANCELLED]: 'tradesTable.statuses.canceled',
  [TransactionStatus.REJECTED]: 'tradesTable.statuses.rejected',
  [TransactionStatus.DEPOSIT_IN_PROGRESS]: 'tradesTable.statuses.depositInProgress',
  [TransactionStatus.WITHDRAW_IN_PROGRESS]: 'tradesTable.statuses.withdrawInProgress',
  [TransactionStatus.WAITING_FOR_DEPOSIT]: 'tradesTable.statuses.waitingForDeposit',
  [TransactionStatus.WAITING_FOR_RECEIVING]: 'tradesTable.statuses.waitingForReceiving'
};
