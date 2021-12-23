import {
  UniV3AlgebraInstantTrade,
  UniV3AlgebraRoute
} from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/uni-v3-algebra-instant-trade';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

export interface AlgebraRoute extends UniV3AlgebraRoute {
  /**
   * List of pools' contract addresses to use in a trade's route.
   */
  path: SymbolToken[];
}

export interface AlgebraInstantTrade extends UniV3AlgebraInstantTrade {
  /**
   * Route info, containing path and output amount.
   */
  route: AlgebraRoute;
}
