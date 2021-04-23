import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';

export enum INTSTANT_TRADES_TRADE_STATUS {
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
  PENDING = 'Pending'
}

type InstantTradesDataTokens = {
  [tokenPart in TokenPart]: SwapToken;
};

export interface InstantTradesTradeData {
  hash: string;
  provider: string;

  token: InstantTradesDataTokens;
  blockchain: BLOCKCHAIN_NAME;

  fromAmount: BigNumber;
  toAmount: BigNumber;
  status: INTSTANT_TRADES_TRADE_STATUS;
  date: moment.Moment;
}
