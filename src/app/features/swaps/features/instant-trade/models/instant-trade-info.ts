import { InstantTrade } from 'rubic-sdk';

export interface InstantTradeInfo {
  trade: InstantTrade;

  /**
   * True, if trade is eth-weth type.
   */
  isWrappedType: boolean;
}
