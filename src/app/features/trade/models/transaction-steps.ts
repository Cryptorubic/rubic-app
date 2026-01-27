export const transactionStep = {
  idle: 'idle',
  error: 'error',
  inactive: 'inactive',

  approveReady: 'approveReady',
  approvePending: 'approvePending',

  authWalletPending: 'authWalletPending',
  authWalletReady: 'authWalletReady',

  trustlinePending: 'trustlinePending',
  trustlineReady: 'trustlineReady',

  swapReady: 'swapReady',
  swapRequest: 'swapRequest',
  swapRetry: 'swapRetry',
  swapBackupSelected: 'swapBackupSelected',

  sourcePending: 'sourcePending',
  destinationPending: 'destinationPending',

  success: 'success'
} as const;

export type TransactionStep = (typeof transactionStep)[keyof typeof transactionStep];
