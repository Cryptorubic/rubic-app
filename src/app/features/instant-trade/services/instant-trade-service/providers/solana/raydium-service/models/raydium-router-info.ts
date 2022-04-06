import BigNumber from 'bignumber.js';
import { Route } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/route';

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
