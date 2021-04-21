import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';

export enum INTSTANT_TRADES_TRADE_STATUS {
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
  PENDING = 'Pending'
}

export interface InstantTradesTradeData {
  hash: string;
  provider: string;

  fromToken: SwapToken;
  toToken: SwapToken;
  blockchain: BLOCKCHAIN_NAME;

  fromAmount: string;
  toAmount: string;
  status: INTSTANT_TRADES_TRADE_STATUS;
  createDate: moment.Moment;
}
