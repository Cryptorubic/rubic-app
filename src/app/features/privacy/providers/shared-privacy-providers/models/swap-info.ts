import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';

export type SwapAmount = {
  visibleValue: string;
  actualValue: BigNumber;
};

export interface PrivateSwapInfo {
  fromAsset: BalanceToken | null;
  toAsset: BalanceToken | null;
  fromAmount: SwapAmount | null;
  toAmount: SwapAmount | null;
  tradeId?: string;
}
