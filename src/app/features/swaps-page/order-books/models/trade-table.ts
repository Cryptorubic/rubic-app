import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { OrderBookTokenPart } from 'src/app/shared/models/order-book/tokens';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface OrderBookTableToken extends SwapToken {
  amountTotal: BigNumber;
  amountContributed: BigNumber;
}

export type OrderBookTableTokens = {
  [tokenPart in OrderBookTokenPart]: OrderBookTableToken;
};

export interface OrderBookTradeTableRow {
  token: OrderBookTableTokens;
  blockchain: BLOCKCHAIN_NAME;
  expirationDate: Date;
}
