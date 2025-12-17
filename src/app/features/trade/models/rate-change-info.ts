import BigNumber from 'bignumber.js';

export interface RateChangeInfo {
  oldAmount: BigNumber;
  newAmount: BigNumber;
  tokenSymbol: string;
}
