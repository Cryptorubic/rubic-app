import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface PaginatedPage {
  page: number;
  maxPage: number;
}

export type TokensNetworkState = Record<BlockchainName, PaginatedPage>;
