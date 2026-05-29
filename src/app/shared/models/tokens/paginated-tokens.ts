import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';

export interface PaginatedPage {
  page: number | null;
  maxPage: number | null;
}

export type TokensNetworkStateKey = BlockchainName;

export type TokensNetworkState = Partial<Record<TokensNetworkStateKey, PaginatedPage>>;

export function assertTokensNetworkStateKey(value: string): asserts value is TokensNetworkStateKey {
  if (!BlockchainsInfo.isBlockchainName(value)) {
    throw new Error(`[assertTokensNetworkStateKey] ${value} is not TokensNetworkStateKey.`);
  }
}
