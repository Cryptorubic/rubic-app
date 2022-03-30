import { List } from 'immutable';
import { Token } from '@shared/models/tokens/token';
import { FromBackendBlockchain } from '@shared/constants/blockchain/backend-blockchains';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export enum ENDPOINTS {
  TOKENS = 'tokens/',
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
  readonly network: BlockchainName;
  readonly address?: string;
  readonly symbol?: string;
}

export interface TokensRequestNetworkOptions {
  readonly network: BlockchainName;
  readonly page: number;
}

export interface TokensListResponse {
  total: number;
  result: List<Token>;
  next: string;
}

export const DEFAULT_PAGE_SIZE = 150;
