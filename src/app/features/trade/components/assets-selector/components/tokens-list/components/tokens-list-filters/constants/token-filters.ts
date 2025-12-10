import {
  TOKEN_FILTERS,
  TokenFilter
} from '@app/features/trade/components/assets-selector/models/token-filters';

export interface TokenFilterUI {
  img: string;
  label: string;
  value: TokenFilter;
}

export const TOKEN_FILTERS_UI: ReadonlyArray<TokenFilterUI> = [
  {
    img: 'assets/images/icons/all-tokens.svg',
    label: 'All Tokens',
    value: TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
  },
  {
    img: 'assets/images/icons/private.svg',
    label: 'Privacy',
    value: TOKEN_FILTERS.ALL_CHAINS_PRIVATE
  }
] as const;
