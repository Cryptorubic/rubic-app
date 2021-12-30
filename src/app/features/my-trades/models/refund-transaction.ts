import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface RefundTransaction {
  hash: string;
  network: BLOCKCHAIN_NAME;
  value: BigNumber;
  tokenAddress: string;
  date: Date;
}
