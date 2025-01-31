import { TokenFilter } from '@app/features/trade/components/assets-selector/models/token-filters';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { List } from 'immutable';

export type AllChainsTokensLists = {
  [key in TokenFilter]: List<TokenAmount>;
};
