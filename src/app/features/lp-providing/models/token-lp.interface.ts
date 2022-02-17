import BigNumber from 'bignumber.js';

export interface TokenLp {
  BRBCAmount: number;
  USDCAmount: number;
  deadline: number;
  isStaked: boolean;
  lastRewardGrowth: number;
  tokenId: number;
  startTime: string;
}

export interface TokenLpParsed {
  BRBCAmount: BigNumber;
  USDCAmount: BigNumber;
  collectedRewards: BigNumber;
  rewardsToCollect: BigNumber;
  deadline: number;
  isStaked: boolean;
  lastRewardGrowth: number;
  tokenId: number;
  start: Date;
  period: number;
}
