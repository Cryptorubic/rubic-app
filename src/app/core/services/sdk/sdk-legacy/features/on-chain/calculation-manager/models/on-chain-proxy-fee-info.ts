import { PriceTokenAmount } from '@cryptorubic/core';

export interface OnChainPlatformFee {
  percent: number;
  token: PriceTokenAmount;
}

export interface OnChainProxyFeeInfo {
  /**
   * Fee in native token, attached as additional value.
   */
  fixedFeeToken: PriceTokenAmount;

  /**
   * Fee in percents of source token.
   */
  platformFee: OnChainPlatformFee;
}
