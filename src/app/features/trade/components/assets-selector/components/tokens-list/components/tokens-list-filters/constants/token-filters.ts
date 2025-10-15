import { AssetListType } from '@features/trade/models/asset';

export interface TokenFilterUI {
  img: string;
  label: string;
  value: AssetListType;
}

export const TOKEN_FILTERS_UI: ReadonlyArray<TokenFilterUI> = [
  {
    img: 'assets/images/icons/all-tokens.svg',
    label: 'All Tokens',
    value: 'allChains'
  },
  {
    img: 'assets/images/icons/trending.svg',
    label: 'Trending',
    value: 'trending'
  },
  {
    img: 'assets/images/icons/gainers.svg',
    label: 'Gainers',
    value: 'gainers'
  },
  {
    img: 'assets/images/icons/losers.svg',
    label: 'Losers',
    value: 'losers'
  }
] as const;
