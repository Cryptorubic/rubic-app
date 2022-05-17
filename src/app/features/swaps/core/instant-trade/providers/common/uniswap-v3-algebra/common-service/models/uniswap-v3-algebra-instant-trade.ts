import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import BigNumber from 'bignumber.js';

export interface UniswapV3AlgebraRoute {
  /**
   * Resulting value in Wei.
   */
  outputAbsoluteAmount: BigNumber;
}

export interface UniswapV3AlgebraInstantTrade extends InstantTrade {
  /**
   * Route info, containing path and output amount.
   */
  route: UniswapV3AlgebraRoute;
}
