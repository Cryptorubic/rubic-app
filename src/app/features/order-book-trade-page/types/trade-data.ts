import BigNumber from 'bignumber.js';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface OrderBookDataToken extends SwapToken {
  amountTotal: BigNumber;
  amountContributed: BigNumber;
  amountLeft: BigNumber;
  investorsNumber: number;
  isApproved: boolean;
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
