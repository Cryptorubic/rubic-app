import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { AlgebraRoute } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/models/AlgebraRoute';

export interface AlgebraInstantTrade extends InstantTrade {
  /**
   * Route info, containing path and output amount.
   */
  route: AlgebraRoute;
}
