import { AssetListType } from '@app/features/trade/models/asset';
import { Observable } from 'rxjs';

export type AssetsSelectorConfig = {
  withChainsFilter: boolean;
  withTokensFilter: boolean;
  withFavoriteTokens: boolean;
  showAllChains: boolean;
  listType?: AssetListType;
  platformLoading$?: Observable<boolean>;
};
