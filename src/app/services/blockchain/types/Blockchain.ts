export enum BLOCKCHAIN_NAME {
  ETHEREUM = 'ETH',
  BINANCE_SMART_CHAIN = 'BSC',
  MATIC = 'MAT'
}

export interface IBlockchain {
  id: Number;
  name: BLOCKCHAIN_NAME;
  nativeCoin: Token;
}

export interface Token {
  blockchainName: BLOCKCHAIN_NAME;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}
