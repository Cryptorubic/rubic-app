export const SQUIDROUTER_TRANSFER_STATUS = {
  SRC_GATEWAY_CALLED: 'source_gateway_called',
  DEST_GATEWAY_APPROVED: 'destination_gateway_approved',
  DEST_EXECUTED: 'destination_executed',
  EXPRESS_EXECUTED: 'express_executed',
  DEST_ERROR: 'error',
  ERROR_FETCHING_STATUS: 'error_fetching_status'
} as const;

export type SquidrouterTransferStatus =
  (typeof SQUIDROUTER_TRANSFER_STATUS)[keyof typeof SQUIDROUTER_TRANSFER_STATUS];
