import { OnChainTradeType } from '@cryptorubic/core';

export interface OnChainSubtype {
  from: OnChainTradeType | undefined;
  to: OnChainTradeType | undefined;
}
