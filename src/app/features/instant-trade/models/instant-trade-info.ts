import InstantTrade from '@features/instant-trade/models/Instant-trade';

export interface InstantTradeInfo {
  trade: InstantTrade;

  /**
   * True, if trade is eth-weth type.
   */
  isWrappedType: boolean;
}
