import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';

interface InstantTradesUniswapAbstractApi {
  hash: string;
  provider: INSTANT_TRADES_PROVIDERS;
  network: string;
}

interface InstantTradesOneInchApi {
  hash: string;
  provider: INSTANT_TRADES_PROVIDERS;
  network: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

interface SolanaTradesApi {
  signature: string;
  provider: INSTANT_TRADES_PROVIDERS;
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
