import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BlockchainToken {
  blockchain: BLOCKCHAIN_NAME;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
