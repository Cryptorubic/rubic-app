import { TokenFilter } from '@app/features/trade/components/assets-selector/models/token-filters';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { List } from 'immutable';

export type TokenListToPatch = 'commonTokens' | 'allChainsTokens';

export type AllChainsTokensLists = {
  ALL_CHAINS_ALL_TOKENS: List<TokenAmount>;
  ALL_CHAINS_PRIVATE: List<TokenAmount>;
};

export interface PatchingFuncOptions {
  // calls force patching specific tokensList in TokensStoreService._allChainsTokens$
  allChainsFilterToPatch?: TokenFilter;
  tokenListToPatch: TokenListToPatch;
}
