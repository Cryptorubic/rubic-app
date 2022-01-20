import {
  UniswapV3AlgebraInstantTrade,
  UniswapV3AlgebraRoute
} from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3-algebra/common-service/models/uniswap-v3-algebra-instant-trade';
import { SymbolToken } from '@shared/models/tokens/symbol-token';

export interface AlgebraRoute extends UniswapV3AlgebraRoute {
  /**
   * List of pools' contract addresses to use in a trade's route.
   */
  path: SymbolToken[];
}

export interface AlgebraInstantTrade extends UniswapV3AlgebraInstantTrade {
  /**
   * Route info, containing path and output amount.
   */
  route: AlgebraRoute;
}
