import BigNumber from 'bignumber.js';

export interface AirdropNode {
  index: number;
  account: string;
  amount: BigNumber;
}
