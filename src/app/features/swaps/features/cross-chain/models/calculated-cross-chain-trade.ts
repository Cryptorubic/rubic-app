import { CrossChainRoute } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/models/cross-chain-route';
import { WrappedCrossChainTrade } from 'rubic-sdk';

export type CalculatedCrossChainTrade = WrappedCrossChainTrade & {
  needApprove: boolean;
  totalProviders: number;
  currentProviders: number;
  route: CrossChainRoute | null;
};
