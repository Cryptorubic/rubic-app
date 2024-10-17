import { WrappedOnChainTradeOrNull } from 'rubic-sdk';

export interface OnChainCalculatedTradeData {
  calculationTime: number;
  total: number;
  calculated: number;
  wrappedTrade: WrappedOnChainTradeOrNull;
}
