import { OrderBookTokens } from './tokens';
import { BLOCKCHAIN_NAME } from '../blockchain/BLOCKCHAIN_NAME';

export interface OrderBookTradeForm {
  token: OrderBookTokens;
  blockchain: BLOCKCHAIN_NAME;
  stopDate: string;
  isPublic: boolean;
  isWithBrokerFee: boolean;
  brokerAddress?: string;

  areAmountsAndTokensSet: boolean;
  areOptionsValid: boolean;
}
