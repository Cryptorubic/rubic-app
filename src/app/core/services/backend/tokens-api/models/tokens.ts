import { List } from 'immutable';
import { Token } from 'src/app/shared/models/tokens/Token';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BackendToken {
  address: string;
  name: string;
  symbol: string;
  blockchain_network: string;
  decimals: number;
  rank: number;
  image: string;
  coingecko_id: string;
  usd_price: number;
  used_in_iframe: boolean;
}

export interface TokensResponse {
  readonly count: number;
  readonly next: string;
  readonly previous: string;
  readonly results: BackendToken[];
}

export interface TokensRequestOptions {
  readonly address?: string;
  readonly network?: BLOCKCHAIN_NAME;
  readonly page: number;
  readonly pageSize?: number;
  readonly symbol?: string;
}

export interface TokensBackendResponse {
  total: number;
  result: List<Token>;
}

export const DEFAULT_PAGE_SIZE = 150;
