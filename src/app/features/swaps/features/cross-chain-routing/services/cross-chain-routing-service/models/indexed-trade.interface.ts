import BigNumber from 'bignumber.js';
import { InstantTrade } from 'rubic-sdk';

export interface TradeAndToAmount {
  trade: InstantTrade | null;
  toAmount: BigNumber;
}

export interface IndexedTradeAndToAmount {
  providerIndex: number;
  tradeAndToAmount: TradeAndToAmount;
}
