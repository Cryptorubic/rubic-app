import { InputToken } from '../../../components/tokens-input/types';

export enum PLATFORM {
  ETHEREUM = 'ethereum',
  BSC = 'binance-smart-chain'
}

export interface SwapToken extends InputToken {
  name: string;
  symbol: string;
  platform: PLATFORM;
  address: string;
  decimals: number;
  image: string;
  rank: number;
  price: number;
}
