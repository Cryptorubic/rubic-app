export enum PLATFORM {
  ETHEREUM = 'ethereum',
  BSC = 'binance-smart-chain'
}

export interface SwapToken {
  name: string;
  symbol: string;
  platform: PLATFORM;
  address: string;
  decimals: number;
  image: string;
  rank: number;
  price: number;
}
