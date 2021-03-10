import InputToken from './InputToken';
import { InstantTradeToken } from '../../../core/services/instant-trade/types';
import { BLOCKCHAIN_NAME } from '../blockchain/IBlockchain';

export default interface SwapToken extends InputToken, InstantTradeToken {
  name: string;
  symbol: string;
  blockchain: BLOCKCHAIN_NAME;
  address: string;
  decimals: number;
  image: string;
  rank: number;
  price: number;
}
