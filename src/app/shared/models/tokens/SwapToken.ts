import InputToken from './InputToken';
import { BLOCKCHAIN_NAME } from '../blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from '../../../features/swaps-page/instant-trades/models/InstantTradeToken';

export default interface SwapToken extends InputToken, InstantTradeToken {
  blockchain: BLOCKCHAIN_NAME;
  price: number;
  used_in_iframe?: boolean;
}
