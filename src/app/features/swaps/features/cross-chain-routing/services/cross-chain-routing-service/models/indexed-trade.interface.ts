import BigNumber from 'bignumber.js';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export interface TradeAndToAmount {
  trade: RubicAny | null;
  toAmount: BigNumber;
}

export interface IndexedTradeAndToAmount {
  providerIndex: number;
  tradeAndToAmount: TradeAndToAmount;
}
