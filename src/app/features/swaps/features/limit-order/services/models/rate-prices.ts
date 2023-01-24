import BigNumber from 'bignumber.js';

export type RateTokenPrice = number | string | BigNumber;

export interface RatePrices {
  fromTokenPrice: RateTokenPrice;
  toTokenPrice: RateTokenPrice;
}
