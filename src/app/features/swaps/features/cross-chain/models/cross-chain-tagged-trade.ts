import { CrossChainCalculatedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';

export type CrossChainTaggedTrade = CrossChainCalculatedTrade & {
  tags: {
    minAmountWarning: boolean;
    maxAmountWarning: boolean;
  };
};
