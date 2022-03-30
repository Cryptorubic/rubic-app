import BigNumber from 'bignumber.js';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface RefundTransaction {
  hash: string;
  network: BlockchainName;
  value: BigNumber;
  tokenAddress: string;
  date: Date;
}
