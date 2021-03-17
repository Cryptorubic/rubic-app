import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface OrderBookTableToken extends SwapToken {
  amountTotal: BigNumber;
}

type OrderBookTableTokens = {
  [tokenPart in TokenPart]: OrderBookTableToken;
};

export interface OrderBookTradeTable {
  token: OrderBookTableTokens;
  blockchain: BLOCKCHAIN_NAME;
  expirationDate: Date;
}
