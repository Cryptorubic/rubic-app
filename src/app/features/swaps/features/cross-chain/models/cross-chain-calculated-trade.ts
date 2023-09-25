import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';
import { WrappedCrossChainTrade } from 'rubic-sdk';

export type CrossChainCalculatedTrade = WrappedCrossChainTrade & {
  needApprove: boolean;
  route: CrossChainRoute | null;
};

export interface CrossChainCalculatedTradeData {
  total: number;
  calculated: number;
  calculationTime: number;

  lastCalculatedTrade?: CrossChainCalculatedTrade | null;
}
