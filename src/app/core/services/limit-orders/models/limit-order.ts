import { Token } from '@shared/models/tokens/token';
import { LIMIT_ORDER_STATUS } from '@core/limit-orders/models/limit-order-status';
import BigNumber from 'bignumber.js';

export interface LimitOrder {
  creation: Date;
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: BigNumber;
  toAmount: BigNumber;
  expiration: Date;
  status: LIMIT_ORDER_STATUS;
}
