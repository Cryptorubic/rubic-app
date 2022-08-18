import { CrossChainTradeType, TradeType } from 'rubic-sdk';
import { LiFiTradeSubtype } from 'rubic-sdk/lib/features/cross-chain/providers/lifi-trade-provider/models/lifi-providers';
import { RangoTradeSubtype } from 'rubic-sdk/lib/features/cross-chain/providers/rango-trade-provider/models/rango-providers';

export interface SmartRouting {
  fromProvider: TradeType | undefined;
  toProvider: TradeType | undefined;
  bridgeProvider:
    | Exclude<CrossChainTradeType, 'LIFI' | 'RANGO'>
    | LiFiTradeSubtype
    | RangoTradeSubtype;
}
