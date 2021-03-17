import BigNumber from 'bignumber.js';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { TokenPart } from '../../../../shared/models/order-book/tokens';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export interface OrderBookFormToken extends SwapToken {
  amount: BigNumber;
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
