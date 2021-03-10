import { Token } from '../tokens/Token';

export interface IBlockchain {
  id: Number;
  name: BLOCKCHAIN_NAME;
  nativeCoin: Token;
}

export enum BLOCKCHAIN_NAME {
  ETHEREUM = 'ETH',
  BINANCE_SMART_CHAIN = 'BSC',
  MATIC = 'MAT'
}
