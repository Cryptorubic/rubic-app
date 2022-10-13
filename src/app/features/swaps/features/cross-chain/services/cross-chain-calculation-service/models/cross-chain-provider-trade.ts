import { CrossChainRoute } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/models/cross-chain-route';
import { WrappedCrossChainTrade } from 'rubic-sdk';

export type CrossChainProviderTrade = WrappedCrossChainTrade & {
  needApprove: boolean;
  totalProviders: number;
  currentProviders: number;
  smartRouting: CrossChainRoute | null;
};
