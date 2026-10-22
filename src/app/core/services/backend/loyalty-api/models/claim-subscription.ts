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

export interface SubmitUserInputRequest {
  userInput: string;
}

export interface SubmitUserInputResponse {
  status: ClaimStatus;
}

export interface ReceiveClaimResponse {
  status: ClaimStatus;
}
