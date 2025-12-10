export const TOKEN_FILTERS = {
  ALL_CHAINS_ALL_TOKENS: 'ALL_CHAINS_ALL_TOKENS',
  ALL_CHAINS_PRIVATE: 'ALL_CHAINS_PRIVATE'
} as const;

export type TokenFilter = (typeof TOKEN_FILTERS)[keyof typeof TOKEN_FILTERS];
