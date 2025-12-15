import { OnChainTradeType } from '@cryptorubic/core';
import { OnChainTrade } from '../common/on-chain-trade/on-chain-trade';
import { RubicSdkError } from '@cryptorubic/web3';

export type WrappedOnChainTradeOrNull = {
  /**
   * Calculated cross-chain trade.
   * Sometimes trade can be calculated even if error was thrown.
   * Equals `null` in case error is critical and trade cannot be calculated.
   */
  trade: OnChainTrade | null;

  /**
   * Type of calculated trade.
   */
  tradeType: OnChainTradeType;

  /**
   * Error, thrown during calculation.
   */
  error?: RubicSdkError;
} | null;
