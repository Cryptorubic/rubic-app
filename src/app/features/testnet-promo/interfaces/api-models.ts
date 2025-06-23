export interface PrizePool {
  left: number;
  total: number;
}

export interface VerificationStatus {
  address: string;
  isVerified: boolean;
}

export interface ProofInfo {
  week: number;
  active: boolean;
  isParticipant: boolean;
  contractAddress: string;
  address: string;
  index: number;
  amount: string;
  proof: string[];
  startDatetime: string;
  endDatetime: string;
}

export interface UserProofs {
  activeRound: ProofInfo | null;
  completed: ProofInfo[];
}

export interface SwapsMainnetInfo {
  totalTrades: number;
  startDatetime: string;
  endDatetime: string;
}

export interface SwapsTestnetInfo {
  totalTrades: number;
}
