import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import BigNumber from 'bignumber.js';

export interface TradeAndToAmount {
  trade: InstantTrade | null;
  toAmount: BigNumber;
}

export interface IndexedTradeAndToAmount {
  providerIndex: number;
  tradeAndToAmount: TradeAndToAmount;
}
