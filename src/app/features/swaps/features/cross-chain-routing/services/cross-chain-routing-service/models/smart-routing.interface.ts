import { TradeType } from 'rubic-sdk';

export interface SmartRouting {
  fromProvider: TradeType;
  toProvider: TradeType;
  fromHasTrade: boolean;
  toHasTrade: boolean;
}
