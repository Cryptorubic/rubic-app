import { OrderBookTokens } from './tokens';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export interface OrderBookTradeForm {
  tokens: OrderBookTokens;
  blockchain: BLOCKCHAIN_NAME;
  stopDate: string;
  isPublic: boolean;
  isWithBrokerFee: boolean;
  brokerAddress?: string;
}
