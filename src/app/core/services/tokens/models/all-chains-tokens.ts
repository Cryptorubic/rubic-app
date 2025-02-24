import { TokenFilter } from '@app/features/trade/components/assets-selector/models/token-filters';
import { TokenAmountWithPriceChange } from '@app/shared/models/tokens/available-token-amount';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { List } from 'immutable';

export type TokenListToPatch = 'commonTokens' | 'allChainsTokens';

export type AllChainsTokensLists = {
  ALL_CHAINS_ALL_TOKENS: List<TokenAmount>;
  ALL_CHAINS_GAINERS: List<TokenAmountWithPriceChange>;
  ALL_CHAINS_LOSERS: List<TokenAmountWithPriceChange>;
  ALL_CHAINS_TRENDING: List<TokenAmountWithPriceChange>;
};

export interface PatchingFuncOptions {
  // calls force patching specific tokensList in TokensStoreService._allChainsTokens$
  allChainsFilterToPatch?: TokenFilter;
  tokenListToPatch: TokenListToPatch;
}
