import { TokenAmount } from '@cryptorubic/core';

export interface DepositFormDetails {
  srcToken: TokenAmount;
  dstToken: TokenAmount;
}
