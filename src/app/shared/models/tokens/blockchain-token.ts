import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface BlockchainToken {
  blockchain: BLOCKCHAIN_NAME;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
