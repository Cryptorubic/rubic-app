import { TradeType } from 'rubic-sdk';

interface InstantTradesUniswapAbstractApi {
  hash: string;
  provider: TradeType;
  network: string;
}

interface InstantTradesOneInchApi {
  hash: string;
  provider: TradeType;
  network: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
}

interface SolanaTradesApi {
  signature: string;
  provider: TradeType;
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
