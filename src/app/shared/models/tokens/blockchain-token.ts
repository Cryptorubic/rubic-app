import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface BlockchainToken {
  blockchain: BlockchainName;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
