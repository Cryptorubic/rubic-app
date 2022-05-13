import BigNumber from 'bignumber.js';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

export interface SmartRouting {
  fromProvider: INSTANT_TRADE_PROVIDER;
  toProvider: INSTANT_TRADE_PROVIDER;
  fromHasTrade: boolean;
  toHasTrade: boolean;
  savings: BigNumber;
}
