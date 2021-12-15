import BigNumber from 'bignumber.js';
import { UniSwapV3Route } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniSwapV3InstantTrade';

export interface UniSwapV3CalculatedInfo {
  route: UniSwapV3Route;
  estimatedGas?: BigNumber;
}

export interface UniSwapV3CalculatedInfoWithProfit extends UniSwapV3CalculatedInfo {
  estimatedGas: BigNumber;
  profit: BigNumber;
}
