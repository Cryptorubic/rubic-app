import BigNumber from 'bignumber.js';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';

export interface SmartRouting {
  fromProvider: INSTANT_TRADE_PROVIDER;
  toProvider: INSTANT_TRADE_PROVIDER;
  fromHasTrade: boolean;
  toHasTrade: boolean;
  savings: BigNumber;
}
