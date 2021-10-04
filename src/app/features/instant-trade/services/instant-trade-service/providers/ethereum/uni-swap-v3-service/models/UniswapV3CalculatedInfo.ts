import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';
import BigNumber from 'bignumber.js';

export interface UniswapV3CalculatedInfo {
  route: UniswapV3Route;
  estimatedGas?: BigNumber;
}

export interface UniswapV3CalculatedInfoWithProfit extends UniswapV3CalculatedInfo {
  estimatedGas: BigNumber;
  profit: BigNumber;
}
