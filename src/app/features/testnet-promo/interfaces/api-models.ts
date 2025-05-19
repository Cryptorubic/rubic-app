export interface PrizePool {
  left: number;
  total: number;
}

export interface VerificationStatus {
  address: string;
  isVerified: boolean;
}

export interface WeekInfo {
  week: number;
  earned: number;
  max: number;
  mainnetSwaps: number;
  testnetSwaps: number;
}

export interface UserStats {
  currentWeek: WeekInfo;
  completedWeeks: WeekInfo[];
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
}

export interface UserProofs {
  activeRound: ProofInfo;
  completed: ProofInfo[];
}
