import { TokenFilter } from '@app/features/trade/components/assets-selector/models/token-filters';
import { AssetType } from '@app/features/trade/models/asset';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { List } from 'immutable';

export interface BalanceLoadingAssetData {
  assetType: AssetType;
  tokenFilter?: TokenFilter;
}

export interface EntitiesForAddingNewTokens {
  tokensList: List<TokenAmount>;
  updateListSubject: (tokens: List<TokenAmount>, tokenFilter: TokenFilter) => void;
}
