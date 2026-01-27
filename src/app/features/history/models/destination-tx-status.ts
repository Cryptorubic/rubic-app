export type DestinationTxStatus =
  | 'pending'
  | 'success'
  | 'not_found'
  | 'fail'
  | 'revert'
  | 'reverted'
  | 'long_pending'
  | 'ready_to_claim'
  | 'waiting_for_refund_trustline';
