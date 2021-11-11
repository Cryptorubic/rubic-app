import InstantTrade from '@features/instant-trade/models/InstantTrade';

export interface InstantTradeInfo {
  trade: InstantTrade;

  /**
   * True, if trade is eth-weth type.
   */
  isWrappedType: boolean;
}
