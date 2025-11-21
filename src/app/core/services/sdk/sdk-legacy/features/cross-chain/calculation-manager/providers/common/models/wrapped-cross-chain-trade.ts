import { RubicSdkError } from '@cryptorubic/web3';
import { CrossChainTradeType } from '../../../models/cross-chain-trade-type';
import { CrossChainTrade } from '../cross-chain-trade';

export interface WrappedCrossChainTrade {
  /**
   * Calculated cross-chain trade.
   * Sometimes trade can be calculated even if error was thrown.
   * Equals `null` in case error is critical and trade cannot be calculated.
   */
  trade: CrossChainTrade<unknown> | null;

  /**
   * Type of calculated trade.
   */
  tradeType: Exclude<CrossChainTradeType, 'multichain'>;

  /**
   * Error, thrown during calculation.
   */
  error?: RubicSdkError;
}
