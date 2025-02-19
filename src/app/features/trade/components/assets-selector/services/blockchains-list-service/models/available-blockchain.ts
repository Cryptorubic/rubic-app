import { BlockchainName } from 'rubic-sdk';
import { BlockchainTag } from '../../../components/blockchains-filter-list/models/BlockchainFilters';

export interface AvailableBlockchain {
  rank: number;
  name: BlockchainName;
  icon: string;
  label: string;
  tags: (string | BlockchainTag)[];
  disabledConfiguration: boolean;
  disabledFrom: boolean;
}

export interface BlockchainItem extends AvailableBlockchain {
  /* name is null for "All Chains" item */
  name: BlockchainName | null;
}
