import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { SwapAmount } from './swap-info';
import BigNumber from 'bignumber.js';

export interface PrivateQuoteAdapter {
  /**
   * callback should return estimated output token amount in wei
   */
  quoteCallback: (
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ) => Promise<BigNumber>;

  /**
   * Fallback invoked if quoteCallback failed
   * you can do any shutdown stuff here like logging, alerts or retries
   */
  quoteFallback: (
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount,
    err: unknown
  ) => Promise<BigNumber>;
}
