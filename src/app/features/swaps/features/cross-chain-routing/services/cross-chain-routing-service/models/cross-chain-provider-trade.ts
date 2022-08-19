import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';

export type CrossChainProviderTrade = WrappedCrossChainTrade & {
  needApprove: boolean;
  totalProviders: number;
  currentProviders: number;
  smartRouting: SmartRouting | null;
};
