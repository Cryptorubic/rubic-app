import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface PaginatedPage {
  page: number | null;
  maxPage: number | null;
}

export type TokensNetworkState = Record<BlockchainName, PaginatedPage>;
