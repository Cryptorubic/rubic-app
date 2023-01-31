import BigNumber from 'bignumber.js';

export interface OrderRate {
  /**
   * Market rate value. Equals NaN in case rate cannot be calculated,
   * because one of tokens does not have price.
   */
  value: BigNumber;

  /**
   * Percent difference between rate in form and market rate.
   */
  percentDiff: number;
}
