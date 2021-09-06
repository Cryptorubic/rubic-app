import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';

interface InstantTradeOptions {
  poolsPath: UniswapV3Route;
  path: string[];
  gasOptimization: boolean;
}

export default InstantTradeOptions;
