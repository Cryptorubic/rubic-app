import { WrappedCrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { CrossChainRoute } from '@features/trade/models/cross-chain-route';

export type CrossChainCalculatedTrade = WrappedCrossChainTrade & {
  needApprove: boolean;
  route: CrossChainRoute | null;
};

export interface CrossChainCalculatedTradeData {
  total: number;
  calculated: number;
  calculationTime: number;

  wrappedTrade?: WrappedCrossChainTrade;
}
