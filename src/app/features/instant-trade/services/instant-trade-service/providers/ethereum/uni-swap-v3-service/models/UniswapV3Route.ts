import BigNumber from 'bignumber.js';
import { LiquidityPool } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/models/LiquidityPool';

export interface UniswapV3Route {
  /**
   * Resulting value in Wei.
   */
  outputAbsoluteAmount: BigNumber;

  /**
   * List of pools' contract addresses to use in a trade's route.
   */
  poolsPath: LiquidityPool[];

  /**
   * From token address.
   */
  initialTokenAddress: string;
}
