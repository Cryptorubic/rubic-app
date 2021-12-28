import { InstantTradeProvider } from '@shared/models/instant-trade/instant-trade-provider';

interface InstantTradesUniswapAbstractApi {
  hash: string;
  provider: InstantTradeProvider;
  network: string;
}

interface InstantTradesOneInchApi {
  hash: string;
  provider: InstantTradeProvider;
  network: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

interface SolanaTradesApi {
  signature: string;
  provider: InstantTradeProvider;
  network: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

export type InstantTradesPostApi =
  | InstantTradesUniswapAbstractApi
  | InstantTradesOneInchApi
  | SolanaTradesApi;
