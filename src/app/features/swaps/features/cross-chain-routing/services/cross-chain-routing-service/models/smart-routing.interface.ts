import { BridgeType, CrossChainTradeType, OnChainTradeType } from 'rubic-sdk';

export interface SmartRouting {
  fromProvider: OnChainTradeType | undefined;
  toProvider: OnChainTradeType | undefined;
  bridgeProvider: Exclude<CrossChainTradeType, 'LIFI' | 'VIA' | 'RANGO'> | BridgeType;
}
