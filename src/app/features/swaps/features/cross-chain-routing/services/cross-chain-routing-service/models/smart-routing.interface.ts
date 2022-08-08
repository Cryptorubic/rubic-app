import { CrossChainTradeType, TradeType } from 'rubic-sdk';
import { LiFiTradeSubtype } from 'rubic-sdk/lib/features/cross-chain/providers/lifi-trade-provider/models/lifi-providers';

export interface SmartRouting {
  fromProvider: TradeType | undefined;
  toProvider: TradeType | undefined;
  bridgeProvider: Exclude<CrossChainTradeType, 'LIFI'> | LiFiTradeSubtype;
}
