interface TokenFilter {
  img: string;
  label: string;
}

export const TOKEN_FILTERS: ReadonlyArray<TokenFilter> = [
  {
    img: 'assets/images/icons/all-tokens.svg',
    label: 'All Tokens'
  },
  {
    img: 'assets/images/icons/trending.svg',
    label: 'Trending'
  },
  {
    img: 'assets/images/icons/gainers.svg',
    label: 'Gainers'
  },
  {
    img: 'assets/images/icons/losers.svg',
    label: 'Losers'
  }
] as const;
