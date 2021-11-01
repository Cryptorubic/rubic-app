import BigNumber from 'bignumber.js';

export interface MerkleData {
  leaves: string[];
  rootIndex: number;
  amount: BigNumber;
}
