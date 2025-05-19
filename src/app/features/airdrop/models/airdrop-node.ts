import { BigNumber } from 'ethers';

export interface AirdropNode {
  index: number;
  account: string;
  amount: BigNumber | string;
}
