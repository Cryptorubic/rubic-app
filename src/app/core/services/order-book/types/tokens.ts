import BigNumber from 'bignumber.js';
import { Token } from '../../../../shared/models/tokens/Token';

export interface OrderBookFormToken extends Token {
  amount: string;
  minContribution: string;
  brokerPercent: string;
}

export interface OrderBookDataToken extends Token {
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
