import { PriceToken } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';

/**
 * Transaction fee information.
 */
export interface FeeInfo {
  /**
   * Fees, taken by cross-chain proxy or celer contract .
   * Attached as additional amounts.
   */
  rubicProxy?: {
    /**
     * Fixed crypto fee attached as additional value.
     */
    fixedFee?: {
      amount: BigNumber;
      token: PriceToken;
    };

    /**
     * Platform fee which is percent from token in amount.
     */
    platformFee?: {
      percent: number;
      token: PriceToken;
    };
  };

  /**
   * Fees, taken by provider.
   * Already included in amounts.
   */
  provider?: {
    /**
     * Crypto fee to pay swap in target network.
     */
    cryptoFee?: {
      amount: BigNumber;
      token: PriceToken;
    };

    /**
     * Platform fee which is percent from token in amount.
     */
    platformFee?: {
      percent: number;
      token: PriceToken;
    };
  };
}
