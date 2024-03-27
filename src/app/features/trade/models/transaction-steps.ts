export const transactionStep = {
  idle: 'idle',
  error: 'error',
  inactive: 'inactive',

  approveWithPermit2: 'approveWithPermit2',
  approveReady: 'approveReady',
  approvePending: 'approvePending',

  swapReady: 'swapReady',
  swapRequest: 'swapRequest',

  sourcePending: 'sourcePending',
  destinationPending: 'destinationPending',

  success: 'success'
} as const;

export type TransactionStep = (typeof transactionStep)[keyof typeof transactionStep];
