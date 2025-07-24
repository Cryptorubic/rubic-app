import { BackendBlockchain, BlockchainName } from '@cryptorubic/core';
import { Token } from '@shared/models/tokens/token';
import { TokenSecurity } from '@shared/models/tokens/token-security';

export enum ENDPOINTS {
  TOKENS = 'v2/tokens/',
  FAVORITE_TOKENS = 'v2/tokens/favorite/',
  TOKENS_SECURITY = 'v2/tokens_security/unknown_token'
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

export interface BackendTokenForAllChains extends BackendToken {
  network: BlockchainName;
  network_rank: number;
}

export interface RatedBackendToken extends BackendToken {
  network: BlockchainName;
  source_rank: number;
  usdPriceChangePercentage24h: number;
  usdPriceChangePercentage7d: number;
}

export interface TokensBackendResponse {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: BackendToken[];
}

export interface TokenSecurityBackendResponse {
  readonly token_security: TokenSecurity;
}

export interface TokensRequestQueryOptions {
  readonly network?: BlockchainName;
  readonly address?: string;
  readonly symbol?: string;
}

export interface TokensRequestNetworkOptions {
  readonly network: BlockchainName;
  readonly page: number;
}

export const DEFAULT_PAGE_SIZE = 200;
