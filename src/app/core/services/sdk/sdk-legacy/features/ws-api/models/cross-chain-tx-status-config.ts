export interface CrossChainTxStatusConfig {
  status:
    | 'PENDING'
    | 'LONG_PENDING'
    | 'REVERT'
    | 'REVERTED'
    | 'FAIL'
    | 'READY_TO_CLAIM'
    | 'SUCCESS'
    | 'NOT_FOUND';

  destinationTxHash: string | null;

  /**
   * non wei
   */
  toAmount?: string;

  toAmountWei?: string;

  subStatus?: 'AWAITING_DEPOSIT' | 'CONFIRMING' | 'EXCHANGING' | 'SENDING' | 'HIDING' | 'PENDING';
}
