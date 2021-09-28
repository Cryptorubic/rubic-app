import { UniswapV2Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2Route';
import BigNumber from 'bignumber.js';

export interface UniswapV2CalculatedInfo {
  route: UniswapV2Route;
  estimatedGas?: BigNumber;
}

export interface UniswapV2CalculatedInfoWithProfit extends UniswapV2CalculatedInfo {
  estimatedGas: BigNumber;
  profit: BigNumber;
}
