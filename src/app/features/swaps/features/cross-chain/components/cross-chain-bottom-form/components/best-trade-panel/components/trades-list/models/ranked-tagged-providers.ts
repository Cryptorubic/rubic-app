import { WrappedCrossChainTrade } from 'rubic-sdk';

export type RankedTaggedProviders = WrappedCrossChainTrade & {
  rank: number;
  tags: {
    best: boolean;
    minAmountWarning: boolean;
    maxAmountWarning: boolean;
  };
};
