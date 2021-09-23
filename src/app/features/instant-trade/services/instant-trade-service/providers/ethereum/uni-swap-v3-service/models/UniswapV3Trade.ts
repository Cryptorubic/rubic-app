import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';

export interface UniswapV3Trade extends InstantTrade {
  /**
   * Pools' path to use in routing.
   */
  poolsPath: UniswapV3Route;
}
