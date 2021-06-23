import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/swaps-page-old/instant-trades/models/InstantTradeToken';

export interface ItProvider {
  createTrade: (
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ) => Promise<void>;
  calculateTrade: (
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ) => Promise<void>;
}
