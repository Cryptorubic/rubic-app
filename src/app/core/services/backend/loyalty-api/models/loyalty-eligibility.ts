export interface LoyaltyEligibilityParams {
  provider: string;
  fromBlockchain: string;
  toBlockchain: string;
}

export interface LoyaltyEligibility {
  eligible: boolean;
}
