import BigNumber from 'bignumber.js';

export interface OrderRate {
  /**
   * Rate value, displayed in form.
   * Can be equal to market rate or set by user.
   * BigNumber(-1) means market rate is unknown.
   */
  value: BigNumber;

  /**
   * Percent difference between rate in form and market rate.
   */
  percentDiff: number;
}
