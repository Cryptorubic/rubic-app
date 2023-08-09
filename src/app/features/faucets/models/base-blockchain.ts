import { BlockchainName } from 'rubic-sdk';

export interface BaseBlockchain {
  readonly name: BlockchainName;
  readonly icon: string;
  readonly label: string;
}
