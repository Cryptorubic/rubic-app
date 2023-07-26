import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { LimitOrderStatus } from 'rubic-sdk';

export interface LimitOrder {
  hash: string;

  creation: Date;
  expiration: Date | null;

  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: BigNumber;
  toAmount: BigNumber;
  fromBalance: BigNumber;

  status: LimitOrderStatus;
  filledPercent: number;

  orderRate: BigNumber;
  marketRate: BigNumber;
}
