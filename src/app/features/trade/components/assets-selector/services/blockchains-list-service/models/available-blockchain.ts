import { BlockchainName } from '@cryptorubic/core';
import { BLOCKCHAIN_TAG } from '../../../models/blockchain-tag';

export interface AvailableBlockchain {
  rank: number;
  name: BlockchainName;
  icon: string;
  label: string;
  tags: (string | BLOCKCHAIN_TAG)[];
  disabledConfiguration: boolean;
  disabledFrom: boolean;
}

export interface BlockchainItem extends AvailableBlockchain {
  /* name is null for "All Chains" item */
  name: BlockchainName | null;
}
