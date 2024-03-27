export const transactionStep = {
  idle: 'idle',
  error: 'error',
  inactive: 'inactive',

  approveOnPermit2: 'approveOnPermit2',
  approveReady: 'approveReady',
  approvePending: 'approvePending',

  swapReady: 'swapReady',
  swapRequest: 'swapRequest',

  sourcePending: 'sourcePending',
  destinationPending: 'destinationPending',

  success: 'success'
} as const;

export type TransactionStep = (typeof transactionStep)[keyof typeof transactionStep];
