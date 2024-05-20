import { BlockchainName } from 'rubic-sdk';
import { BlockchainFilter } from '../../../components/blockchains-filter-list/models/BlockchainFilters';

export interface AvailableBlockchain {
  rank: number;

  name: BlockchainName;
  icon: string;
  label: string;
  tags: string[];
  tag: BlockchainFilter;
  disabledConfiguration: boolean;
  disabledFrom: boolean;
}
