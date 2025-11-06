import { WrappedCrossChainTradeOrNull } from './wrapped-cross-chain-trade-or-null';

/**
 * Cross-chain providers data.
 */
export interface CrossChainReactivelyCalculatedTradeData {
  /**
   * Total amount of providers to calculate.
   */
  total: number;

  /**
   * Calculated amount of providers at current moment.
   */
  calculated: number;

  /**
   * Last calculated trade.
   */
  wrappedTrade: WrappedCrossChainTradeOrNull;
}
