import BigNumber from 'bignumber.js';
import { UniswapV3Route } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/models/uniswap-v3-instant-trade';

export interface UniswapV3CalculatedInfo {
  route: UniswapV3Route;
  estimatedGas?: BigNumber;
}

export interface UniswapV3CalculatedInfoWithProfit extends UniswapV3CalculatedInfo {
  estimatedGas: BigNumber;
  profit: BigNumber;
}
