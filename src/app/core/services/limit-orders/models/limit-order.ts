import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { LIMIT_ORDER_STATUS } from 'rubic-sdk';

export interface LimitOrder {
  creation: Date;
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: BigNumber;
  toAmount: BigNumber;
  expiration: Date | null;
  status: LIMIT_ORDER_STATUS;
  hash: string;
}
