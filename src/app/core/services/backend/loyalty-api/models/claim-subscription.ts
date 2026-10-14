import { ClaimStatus } from './claim-history-item';

export interface ClaimSubscriptionRequest {
  variantId: string;
  userInput?: string;
}

export interface ClaimSubscriptionResponse {
  claimId: string;
  status: ClaimStatus;
  confirmedBalance: number;
}
