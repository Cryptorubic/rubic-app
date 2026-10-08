export type ClaimStatus = 'requested' | 'ready' | 'received';

export interface ClaimHistoryItem {
  claimId: string;
  subscriptionTitle: string;
  status: ClaimStatus;
  code?: string | null;
  createdAt: string;
}
