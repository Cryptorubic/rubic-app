import BigNumber from 'bignumber.js';
import { TokenPart } from '../../../shared/models/order-book/tokens';
import SwapToken from '../../../shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export interface OrderBookDataToken extends SwapToken {
  imageLink: string;

  amountTotal: BigNumber;
  amountContributed: BigNumber;
  amountLeft: BigNumber;
  investorsNumber: number;
  minContribution: BigNumber;
  brokerPercent: number;
}

type OrderBookDataTokens = {
  [tokenPart in TokenPart]: OrderBookDataToken;
};

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
