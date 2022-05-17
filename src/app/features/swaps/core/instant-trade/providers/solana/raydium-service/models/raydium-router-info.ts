import BigNumber from 'bignumber.js';
import { Route } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/route';

export interface RaydiumRouterInfo {
  maxAmountOut: BigNumber;
  middleCoin: {
    address: string;
    symbol: string;
    decimals: number;
  };
  priceImpact: number;
  route: [Route, Route];
}
