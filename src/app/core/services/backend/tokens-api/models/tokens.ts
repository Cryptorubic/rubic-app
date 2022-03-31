import { List } from 'immutable';
import { Token } from '@shared/models/tokens/token';
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
  user: string;
}

export interface BackendToken {
  address: string;
  name: string;
  symbol: string;
  blockchainNetwork: FromBackendBlockchain;
  decimals: number;
  rank: number;
  image: string;
  coingeckoId: string;
  usdPrice: number;
  usedInIframe: boolean;
  hasDirectPair: boolean;
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
