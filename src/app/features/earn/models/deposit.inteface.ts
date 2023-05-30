import BigNumber from 'bignumber.js';

export interface Deposit {
  id: string;
  amount: BigNumber;
  endTimestamp: number;
  totalNftRewards: BigNumber;
  tokenApr: BigNumber;
  canWithdraw: boolean;
}
