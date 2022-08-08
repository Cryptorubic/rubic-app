import { BlockchainName } from 'rubic-sdk';

export interface PaginatedPage {
  page: number | null;
  maxPage: number | null;
}

export type TokensNetworkState = Partial<Record<BlockchainName, PaginatedPage>>;
