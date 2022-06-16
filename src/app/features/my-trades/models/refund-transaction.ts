import BigNumber from 'bignumber.js';
import { BlockchainName } from 'rubic-sdk';

export interface RefundTransaction {
  hash: string;
  network: BlockchainName;
  value: BigNumber;
  tokenAddress: string;
  date: Date;
}
