import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';

export interface UniswapV2InstantTrade extends InstantTrade {
  /**
   * tokens' addresses in a swap route
   */
  path: string[];
}
