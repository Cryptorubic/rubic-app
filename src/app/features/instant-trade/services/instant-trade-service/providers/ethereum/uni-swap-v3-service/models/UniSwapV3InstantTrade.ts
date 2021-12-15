import {
  UniV3AlgebraInstantTrade,
  UniV3AlgebraRoute
} from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/UniV3AlgebraInstantTrade';
import { LiquidityPool } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/quoter-controller/models/LiquidityPool';

export interface UniSwapV3Route extends UniV3AlgebraRoute {
  /**
   * List of pools' contract addresses to use in a trade's route.
   */
  poolsPath: LiquidityPool[];

  /**
   * From token address.
   */
  initialTokenAddress: string;
}

export interface UniSwapV3InstantTrade extends UniV3AlgebraInstantTrade {
  /**
   * Route info, containing path and output amount.
   */
  route: UniSwapV3Route;
}
