import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';

export interface UniswapInstantTrade extends InstantTrade {
  /**
   * tokens' addresses in a swap route
   */
  path: string[];
}
