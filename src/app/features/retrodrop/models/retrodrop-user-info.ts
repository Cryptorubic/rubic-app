import BigNumber from 'bignumber.js';

export interface RetrodropUserClaimInfo {
  round: number;
  is_participant: boolean;
  address: string;
  index: number;
  amount: string;
  proof: string[];
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
