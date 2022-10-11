import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { WrappedCrossChainTrade } from 'rubic-sdk';

export type CrossChainProviderTrade = WrappedCrossChainTrade & {
  needApprove: boolean;
  totalProviders: number;
  currentProviders: number;
  smartRouting: SmartRouting | null;
};
