export type DestinationTxStatus =
  | 'pending'
  | 'success'
  | 'not found'
  | 'fail'
  | 'revert'
  | 'reverted'
  | 'long_pending'
  | 'ready_to_claim';
