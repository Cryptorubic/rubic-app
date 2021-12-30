import InstantTrade from '@features/instant-trade/models/instant-trade';

export interface InstantTradeInfo {
  trade: InstantTrade;

  /**
   * True, if trade is eth-weth type.
   */
  isWrappedType: boolean;
}
