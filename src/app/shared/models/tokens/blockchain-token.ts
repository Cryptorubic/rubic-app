import { BlockchainName } from 'rubic-sdk';

export interface BlockchainToken {
  blockchain: BlockchainName;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
