import { WrappedOnChainTradeOrNull } from '@cryptorubic/sdk';

export interface OnChainCalculatedTradeData {
  calculationTime: number;
  total: number;
  calculated: number;
  wrappedTrade: WrappedOnChainTradeOrNull;
}
