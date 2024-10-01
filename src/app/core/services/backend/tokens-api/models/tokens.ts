import { List } from 'immutable';
import { Token } from '@shared/models/tokens/token';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import { BackendBlockchain, BlockchainName } from 'rubic-sdk';

export enum ENDPOINTS {
  TOKENS = 'v1/tokens/',
  FAVORITE_TOKENS = 'v1/tokens/favorite/',
  TOKENS_SECURITY = 'v1/tokens_security/unknown_token'
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
  token_security: TokenSecurity | null;
  type: Token['type'];
}

export interface TokensBackendResponse {
  readonly count: number;
  readonly next: string;
  readonly previous: string;
  readonly results: BackendToken[];
}

export interface TokenSecurityBackendResponse {
  readonly token_security: TokenSecurity;
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

export const DEFAULT_PAGE_SIZE = 200;
