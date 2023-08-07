import { BlockchainName } from 'rubic-sdk';

export interface BaseBlockchain {
  name: BlockchainName;
  icon: string;
  label: string;
}
