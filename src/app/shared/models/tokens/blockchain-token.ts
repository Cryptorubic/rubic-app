import { BlockchainName } from '@cryptorubic/core';

export interface BlockchainToken {
  blockchain: BlockchainName;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
