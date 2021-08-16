import BigNumber from 'bignumber.js';

export interface EvoResponseToken {
  symbol: string;
  token: string;
  defaultFee: string;
  defaultFeeBase: string;
  feeTarget: string;
  defaultMinAmount: BigNumber;
  defaultMaxAmount: BigNumber;
  dailyLimit: string;
  bonus: number;
}
