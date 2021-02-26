export enum BLOCKCHAIN_NAMES {
  ETHEREUM = 'ETH',
  BINANCE_SMART_CHAIN = 'BSC',
  MATIC = 'MAT'
}

export enum MODE_NAMES {
  INSTANT_TRADE = 'INSTANT_TRADE',
  ORDER_BOOK = 'ORDER_BOOK'
}

export interface IToken {
  address: string;
  token_title: string;
  token_short_title: string;
  decimals: number;

  amount: number;
}
