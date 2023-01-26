import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { LIMIT_ORDER_STATUS } from 'rubic-sdk';

export interface LimitOrder {
  hash: string;

  creation: Date;
  expiration: Date | null;

  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: BigNumber;
  toAmount: BigNumber;
  fromBalance: BigNumber;

  status: LIMIT_ORDER_STATUS;
  filledPercent: number;

  orderRate: BigNumber;
  marketRate: BigNumber;
}
