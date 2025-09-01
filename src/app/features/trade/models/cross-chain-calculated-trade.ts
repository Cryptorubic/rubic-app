import { WrappedCrossChainTrade } from '@cryptorubic/sdk';
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
