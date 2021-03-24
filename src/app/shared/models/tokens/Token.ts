import { BLOCKCHAIN_NAME } from '../blockchain/BLOCKCHAIN_NAME';

export interface Token {
  blockchainName: BLOCKCHAIN_NAME;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
