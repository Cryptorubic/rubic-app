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

  destinationNetworkTitle: string | null;

  destinationNetworkChainId: number | null;

  subStatus?: 'AWAITING_DEPOSIT' | 'CONFIRMING' | 'EXCHANGING' | 'SENDING';
}
