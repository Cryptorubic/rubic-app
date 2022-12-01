import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-select/services/search-query-service/search-query.service';
import { BlockchainsListService } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/blockchains-list.service';
import { TokensListStoreService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list-store.service';
import { TokensListService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list.service';

export const TokensSelectorServices = [
  TokensSelectorService,
  SearchQueryService,
  BlockchainsListService,
  TokensListStoreService,
  TokensListService
];
