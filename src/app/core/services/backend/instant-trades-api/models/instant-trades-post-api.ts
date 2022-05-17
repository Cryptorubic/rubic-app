import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';

interface InstantTradesUniswapAbstractApi {
  hash: string;
  provider: INSTANT_TRADE_PROVIDER;
  network: string;
}

interface InstantTradesOneInchApi {
  hash: string;
  provider: INSTANT_TRADE_PROVIDER;
  network: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

interface SolanaTradesApi {
  signature: string;
  provider: INSTANT_TRADE_PROVIDER;
  network: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

export type InstantTradesPostApi = (
  | InstantTradesUniswapAbstractApi
  | InstantTradesOneInchApi
  | SolanaTradesApi
) & { user: string; fee?: number; promocode?: string };
