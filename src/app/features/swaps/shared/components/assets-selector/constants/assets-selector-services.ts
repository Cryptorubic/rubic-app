import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { BlockchainsListService } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { TokensListStoreService } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { TokensListService } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/tokens-list.service';
import { TokensListTypeService } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

/**
 * Singleton services, which are destroyed after selector is closed.
 */
export const AssetsSelectorServices = [
  AssetsSelectorService,
  SearchQueryService,
  BlockchainsListService,

  TokensListTypeService,
  TokensListStoreService,
  TokensListService,

  TuiDestroyService
];
