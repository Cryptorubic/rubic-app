export type DestinationTxStatus =
  | 'pending'
  | 'success'
  | 'not_found'
  | 'fail'
  | 'revert'
  | 'reverted'
  | 'long_pending'
  | 'ready_to_claim'
  | 'refund';
