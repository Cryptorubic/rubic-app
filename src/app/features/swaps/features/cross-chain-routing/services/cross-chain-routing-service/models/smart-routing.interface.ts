import { BridgeType, CrossChainTradeType, TradeType } from 'rubic-sdk';

export interface SmartRouting {
  fromProvider: TradeType | undefined;
  toProvider: TradeType | undefined;
  bridgeProvider: Exclude<CrossChainTradeType, 'LIFI' | 'VIA'> | BridgeType;
}
