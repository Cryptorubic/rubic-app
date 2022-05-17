import { UniswapV2Route } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-route';
import BigNumber from 'bignumber.js';

export interface UniswapV2CalculatedInfo {
  route: UniswapV2Route;
  estimatedGas?: BigNumber;
}

export interface UniswapV2CalculatedInfoWithProfit extends UniswapV2CalculatedInfo {
  estimatedGas: BigNumber;
  profit: BigNumber;
}
