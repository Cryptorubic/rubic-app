export enum TransactionStatus {
  PENDING = 'pending',
  DEPOSIT_IN_PROGRESS = 'deposit in progress',
  WITHDRAW_IN_PROGRESS = 'withdraw in progress',
  WAITING_FOR_DEPOSIT = 'waiting for deposit',
  WAITING_FOR_RECEIVING = 'waiting for receiving',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}
