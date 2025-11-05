import { OnChainTradeType } from '@cryptorubic/core';
import { RubicSdkError } from '@cryptorubic/web3';

export interface OnChainTradeError {
  type: OnChainTradeType;
  error: RubicSdkError;
}
