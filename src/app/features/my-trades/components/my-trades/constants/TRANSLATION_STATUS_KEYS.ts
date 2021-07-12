import { TRANSACTION_STATUS } from '../../../../../shared/models/blockchain/TRANSACTION_STATUS';

export const TRANSLATION_STATUS_KEY = {
  [TRANSACTION_STATUS.COMPLETED]: 'tradesTable.statuses.completed',
  [TRANSACTION_STATUS.PENDING]: 'tradesTable.statuses.pending',
  [TRANSACTION_STATUS.CANCELLED]: 'tradesTable.statuses.canceled',
  [TRANSACTION_STATUS.REJECTED]: 'tradesTable.statuses.rejected',
  [TRANSACTION_STATUS.DEPOSIT_IN_PROGRESS]: 'tradesTable.statuses.depositInProgress',
  [TRANSACTION_STATUS.WITHDRAW_IN_PROGRESS]: 'tradesTable.statuses.withdrawInProgress',
  [TRANSACTION_STATUS.WAITING_FOR_DEPOSIT]: 'tradesTable.statuses.waitingForDeposit',
  [TRANSACTION_STATUS.WAITING_FOR_RECEIVING]: 'tradesTable.statuses.waitingForReceiving'
};
