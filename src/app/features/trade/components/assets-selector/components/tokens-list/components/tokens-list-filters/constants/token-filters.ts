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
    img: 'assets/images/icons/trending.svg',
    label: 'Trending',
    value: TOKEN_FILTERS.ALL_CHAINS_TRENDING
  },
  {
    img: 'assets/images/icons/gainers.svg',
    label: 'Gainers',
    value: TOKEN_FILTERS.ALL_CHAINS_GAINERS
  },
  {
    img: 'assets/images/icons/losers.svg',
    label: 'Losers',
    value: TOKEN_FILTERS.ALL_CHAINS_LOSERS
  }
] as const;
