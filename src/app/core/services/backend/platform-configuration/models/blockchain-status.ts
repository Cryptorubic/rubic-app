import { BlockchainName } from '@cryptorubic/core';

export interface BlockchainStatus {
  isActive: boolean;
  tier: 1 | 2;
  blockchain: BlockchainName;
}
