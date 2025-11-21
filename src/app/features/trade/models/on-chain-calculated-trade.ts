import { WrappedOnChainTradeOrNull } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';

export interface OnChainCalculatedTradeData {
  calculationTime: number;
  total: number;
  calculated: number;
  wrappedTrade: WrappedOnChainTradeOrNull;
}
