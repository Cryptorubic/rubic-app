import { BLOCKCHAIN_NAME } from '../blockchain/BLOCKCHAIN_NAME';
import { OrderBookDataTokens } from './tokens';

export enum ORDER_BOOK_TRADE_STATUS {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  CANCELLED = 'Cancelled',
  DONE = 'Done'
}

export interface OrderBookTradeData {
  memo: string;
  contractAddress: string;

  token: OrderBookDataTokens;
  blockchain: BLOCKCHAIN_NAME;
  status: ORDER_BOOK_TRADE_STATUS;
  expirationDate: Date;
  isPublic: boolean;
}
