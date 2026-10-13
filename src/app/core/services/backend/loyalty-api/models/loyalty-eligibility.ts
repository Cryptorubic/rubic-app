export interface LoyaltyEligibilityParams {
  provider: string;
  fromBlockchain: string;
  toBlockchain: string;
  isZeroFee?: boolean;
}

export interface LoyaltyEligibility {
  eligible: boolean;
}
