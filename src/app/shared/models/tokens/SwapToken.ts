import InputToken from './InputToken';
import { BLOCKCHAIN_NAME } from '../blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from '../../../features/swaps-page/instant-trades/models/InstantTradeToken';

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
