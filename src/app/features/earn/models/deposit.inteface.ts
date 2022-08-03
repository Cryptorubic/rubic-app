import BigNumber from 'bignumber.js';
import { IntervalReward } from './interval-rewards.interface';

export interface Deposit {
  id: string;
  amount: BigNumber;
  endTimestamp: number;
  totalNftRewards: BigNumber;
  rewardIntervals: IntervalReward[];
  tokenApr: BigNumber;
  canWithdraw: boolean;
}
