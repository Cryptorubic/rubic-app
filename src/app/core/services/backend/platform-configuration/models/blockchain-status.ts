import { BlockchainName } from 'rubic-sdk';

export interface BlockchainStatus {
  isActive: boolean;
  tier: 1 | 2;
  blockchain: BlockchainName;
}
