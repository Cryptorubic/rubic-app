import { List } from 'immutable';
import { Token } from 'src/app/shared/models/tokens/Token';
import { PAGINATED_BLOCKCHAIN_NAME } from 'src/app/shared/models/tokens/paginated-tokens';
import { FromBackendBlockchain } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';

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
  result: List<Token>;
  next: string;
}

export const DEFAULT_PAGE_SIZE = 150;
