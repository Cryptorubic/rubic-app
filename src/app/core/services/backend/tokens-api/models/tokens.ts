import { List } from 'immutable';
import { Token } from '@shared/models/tokens/token';
import { BackendBlockchain } from '@shared/constants/blockchain/backend-blockchains';
import { BlockchainName } from 'rubic-sdk';

export enum ENDPOINTS {
  TOKENS = 'v1/tokens/',
  IFRAME_TOKENS = 'v1/tokens/iframe/',
  FAVORITE_TOKENS = 'v1/tokens/favorite/'
}

export interface FavoriteTokenRequestParams {
  network: string;
  address: string;
  user: string;
}

export interface BackendToken {
  address: string;
  name: string;
  symbol: string;
  blockchainNetwork: BackendBlockchain;
  decimals: number;
  rank: number;
  image: string;
  coingeckoId: string;
  usdPrice: number;
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

export const DEFAULT_PAGE_SIZE = 50;
