import BigNumber from 'bignumber.js';

export interface PlatformFee {
  percent: number;
  amount: BigNumber;
  amountInUsd: BigNumber;
  tokenSymbol: string;
}
