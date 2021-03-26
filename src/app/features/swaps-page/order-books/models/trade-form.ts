import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface OrderBookFormToken extends SwapToken {
  amount: string;
  minContribution: string;
  brokerPercent: string;
}

type OrderBookFormTokens = {
  [tokenPart in TokenPart]: OrderBookFormToken;
};

export interface OrderBookTradeForm {
  token: OrderBookFormTokens;
  blockchain: BLOCKCHAIN_NAME;
  stopDate: string;
  isPublic: boolean;
  isWithBrokerFee: boolean;
  brokerAddress?: string;

  areAmountsAndTokensSet: boolean;
  areOptionsValid: boolean;
}
