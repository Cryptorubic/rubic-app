import {
  UniswapV3AlgebraInstantTrade,
  UniswapV3AlgebraRoute
} from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3-algebra/common-service/models/uniswap-v3-algebra-instant-trade';
import { LiquidityPool } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/utils/quoter-controller/models/liquidity-pool';

export interface UniswapV3Route extends UniswapV3AlgebraRoute {
  /**
   * List of pools' contract addresses to use in a trade's route.
   */
  poolsPath: LiquidityPool[];

  /**
   * From token address.
   */
  initialTokenAddress: string;
}

export interface UniswapV3InstantTrade extends UniswapV3AlgebraInstantTrade {
  /**
   * Route info, containing path and output amount.
   */
  route: UniswapV3Route;
}
