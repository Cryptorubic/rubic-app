import {
  TOKEN_FILTERS,
  TokenFilter
} from '@app/features/trade/components/assets-selector/models/token-filters';

export const GAINERS_LOSERS_ORDER = {
  LOSERS_24HRS: 'usdPriceChangePercentage24h',
  GAINERS_24HRS: '-usdPriceChangePercentage24h',
  LOSERS_7DAYS: 'usdPriceChangePercentage7d',
  GAINERS_7DAYS: '-usdPriceChangePercentage7d'
} as const;

export type GainersLosersOrder = (typeof GAINERS_LOSERS_ORDER)[keyof typeof GAINERS_LOSERS_ORDER];

export const ORDERING_TYPE_TO_TOKEN_FILTER: Record<GainersLosersOrder, TokenFilter> = {
  [GAINERS_LOSERS_ORDER.GAINERS_24HRS]: TOKEN_FILTERS.ALL_CHAINS_GAINERS,
  [GAINERS_LOSERS_ORDER.GAINERS_7DAYS]: TOKEN_FILTERS.ALL_CHAINS_GAINERS,
  [GAINERS_LOSERS_ORDER.LOSERS_24HRS]: TOKEN_FILTERS.ALL_CHAINS_LOSERS,
  [GAINERS_LOSERS_ORDER.LOSERS_7DAYS]: TOKEN_FILTERS.ALL_CHAINS_LOSERS
} as const;
