import { OnChainTrade } from 'rubic-sdk';

export interface InstantTradeInfo {
  trade: OnChainTrade;

  /**
   * True, if trade is eth-weth type.
   */
  isWrappedType: boolean;
}
