import { TokensSelectorService } from '@features/swaps/shared/components/tokens-selector/services/tokens-selector-service/tokens-selector.service';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-selector/services/search-query-service/search-query.service';
import { BlockchainsListService } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/blockchains-list.service';
import { TokensListStoreService } from '@features/swaps/shared/components/tokens-selector/services/tokens-list-service/tokens-list-store.service';
import { TokensListService } from '@features/swaps/shared/components/tokens-selector/services/tokens-list-service/tokens-list.service';
import { TokensListTypeService } from '@features/swaps/shared/components/tokens-selector/services/tokens-list-service/tokens-list-type.service';

/**
 * Singleton services, which are destroyed after selector is closed.
 */
export const TokensSelectorServices = [
  TokensSelectorService,
  SearchQueryService,
  BlockchainsListService,

  TokensListTypeService,
  TokensListStoreService,
  TokensListService
];
