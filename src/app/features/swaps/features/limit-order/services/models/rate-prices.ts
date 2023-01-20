import BigNumber from 'bignumber.js';

export interface RatePrices {
  fromTokenPrice: number | string | BigNumber;
  toTokenPrice: number | string | BigNumber;
}
