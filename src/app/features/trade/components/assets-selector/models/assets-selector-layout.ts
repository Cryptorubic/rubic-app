import { AssetListType } from '@app/features/trade/models/asset';

export type AssetsSelectorConfig = {
  withChainsFilter: boolean;
  withTokensFilter: boolean;
  withFavoriteTokens: boolean;
  showAllChains: boolean;
  listType?: AssetListType;
};
