import BigNumber from 'bignumber.js';
import SwapToken from '../tokens/SwapToken';

export interface OrderBookFormToken extends SwapToken {
  amount: BigNumber;
  minContribution: string;
  brokerPercent: string;
}

export interface OrderBookDataToken extends SwapToken {
  imageLink: string;

  amountTotal: BigNumber;
  amountContributed: BigNumber;
  amountLeft: BigNumber;
  investorsNumber: number;
  minContribution: BigNumber;
  brokerPercent: number;
}

export type TokenPart = 'base' | 'quote';

export type OrderBookTokens = {
  [tokenPart in TokenPart]: OrderBookFormToken;
};

export type OrderBookDataTokens = {
  [tokenPart in TokenPart]: OrderBookDataToken;
};
