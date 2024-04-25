import BigNumber from 'bignumber.js';

export interface RetrodropUserClaimInfo {
  round: number;
  is_participant: boolean;
  address: string;
  index: number;
  amount: string;
  proof: string[];
  already_claimed_from_old_contract: boolean;
}

export type RetrodropUserInfo = RetrodropUserClaimInfo[];

export interface RetrodropUserClaimedAmount {
  round: number;
  amount: BigNumber;
}

export interface RetrodropUserAddressRoundValid {
  round: number;
  isValid: boolean;
}
