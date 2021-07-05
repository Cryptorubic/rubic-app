import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InputToken from './InputToken';
import { BLOCKCHAIN_NAME } from '../blockchain/BLOCKCHAIN_NAME';

export default interface SwapToken extends InputToken, InstantTradeToken {
  blockchain: BLOCKCHAIN_NAME;
  price: number;
  used_in_iframe?: boolean;
}
