import { List } from 'immutable';
import { Tokens } from '@shared/models/tokens/tokens';
import { PAGINATED_BLOCKCHAIN_NAME } from 'src/app/shared/models/tokens/paginated-tokens';
import { FromBackendBlockchain } from '@shared/constants/blockchain/backend-blockchains';

export enum ENDPOINTS {
  TOKKENS = 'tokens/',
  IFRAME_TOKENS = 'tokens/iframe/',
  FAVORITE_TOKENS = 'tokens/favorite/'
}

export interface FavoriteTokenRequestParams {
  blockchain_network: string;
  address: string;
}

export interface BackendToken {
  address: string;
  name: string;
  symbol: string;
  blockchain_network: FromBackendBlockchain;
  decimals: number;
  rank: number;
  image: string;
  coingecko_id: string;
  usd_price: number;
  used_in_iframe: boolean;
}

export interface TokensBackendResponse {
  readonly count: number;
  readonly next: string;
  readonly previous: string;
  readonly results: BackendToken[];
}

export interface TokensRequestQueryOptions {
  readonly network: PAGINATED_BLOCKCHAIN_NAME;
  readonly address?: string;
  readonly symbol?: string;
}

export interface TokensRequestNetworkOptions {
  readonly network: PAGINATED_BLOCKCHAIN_NAME;
  readonly page: number;
}

export interface TokensListResponse {
  total: number;
  result: List<Tokens>;
  next: string;
}

export const DEFAULT_PAGE_SIZE = 150;
