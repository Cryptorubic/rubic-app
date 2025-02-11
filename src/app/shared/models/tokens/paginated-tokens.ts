import {
  TOKEN_FILTERS,
  TokenFilter
} from '@app/features/trade/components/assets-selector/models/token-filters';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';

export interface PaginatedPage {
  page: number | null;
  maxPage: number | null;
}

export type TokensNetworkStateKey = BlockchainName | TokenFilter;

export type TokensNetworkState = Partial<Record<TokensNetworkStateKey, PaginatedPage>>;

export function isTokensNetworkStateKey(
  assetType: string,
  tokenFilter: string
): assetType is TokensNetworkStateKey {
  return (
    BlockchainsInfo.isBlockchainName(assetType) ||
    Object.values(TOKEN_FILTERS).some(filter => tokenFilter === filter)
  );
}

export function assertTokensNetworkStateKey(value: string): asserts value is TokensNetworkStateKey {
  if (
    !BlockchainsInfo.isBlockchainName(value) &&
    !Object.values(TOKEN_FILTERS).some(filter => value === filter)
  ) {
    throw new Error(`[assertTokensNetworkStateKey] ${value} is not TokensNetworkStateKey.`);
  }
}
