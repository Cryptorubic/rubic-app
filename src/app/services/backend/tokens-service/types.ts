import { InputToken } from '../../../components/tokens-input/types';
import { InstantTradeToken } from '../../instant-trade/types';

export enum PLATFORM {
  ETHEREUM = 'ethereum',
  BSC = 'binance-smart-chain'
}

export interface SwapToken extends InputToken, InstantTradeToken {
  name: string;
  symbol: string;
  platform: PLATFORM;
  address: string;
  decimals: number;
  image: string;
  rank: number;
  price: number;
}
