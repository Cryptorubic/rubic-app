import { TuiDestroyService } from '@taiga-ui/cdk';
import { SearchQueryService } from '@features/trade/components/assets-selector/services/search-query-service/search-query.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';

/**
 * Singleton services, which are destroyed after selector is closed.
 */
export const AssetsSelectorServices = [
  AssetsSelectorService,
  SearchQueryService,
  TokensListTypeService,
  TokensListStoreService,
  TokensListService,
  TuiDestroyService
];
