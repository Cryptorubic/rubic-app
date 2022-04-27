export interface LpReward {
  created_at: string;
  hash: string;
  amount: number;
}

export interface LpRewardParsed {
  txHash: string;
  scannerLink: string;
  rewards: number;
  date: Date;
  balance?: number;
}
