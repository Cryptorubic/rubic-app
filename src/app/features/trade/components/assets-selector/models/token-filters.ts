export const TOKEN_FILTERS = {
  ALL_TOKENS: 'ALL_TOKENS',
  TRENDING: 'TRENDING',
  GAINERS: 'GAINERS',
  LOSERS: 'LOSERS'
} as const;

export type TokenFilter = (typeof TOKEN_FILTERS)[keyof typeof TOKEN_FILTERS];
