import { UniswapRoute } from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapRoute';
import BigNumber from 'bignumber.js';

export interface UniswapV2CalculatedInfo {
  route: UniswapRoute;
  estimatedGas?: BigNumber;
}

export interface UniswapV2CalculatedInfoWithProfit extends UniswapV2CalculatedInfo {
  profit: BigNumber;
}
