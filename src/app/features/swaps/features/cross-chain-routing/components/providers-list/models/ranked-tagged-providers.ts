import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';

export type RankedTaggedProviders = WrappedCrossChainTrade & {
  rank: number;
  tags: {
    best: boolean;
    minAmountWarning: boolean;
    maxAmountWarning: boolean;
  };
};
