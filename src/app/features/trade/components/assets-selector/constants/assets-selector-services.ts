import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';

/**
 * Singleton services, which are destroyed after selector is closed.
 */
export const AssetsSelectorServices = [TokensListTypeService, TokensListService, TuiDestroyService];
