import BigNumber from 'bignumber.js';
import { OnChainTrade } from 'rubic-sdk';

export interface TradeAndToAmount {
  trade: OnChainTrade | null;
  toAmount: BigNumber;
}

export interface IndexedTradeAndToAmount {
  providerIndex: number;
  tradeAndToAmount: TradeAndToAmount;
}
