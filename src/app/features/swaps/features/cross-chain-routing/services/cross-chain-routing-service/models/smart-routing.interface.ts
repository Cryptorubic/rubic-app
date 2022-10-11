import { BridgeType, CrossChainTradeType, OnChainTradeType } from 'rubic-sdk';

export interface SmartRouting {
  fromProvider: OnChainTradeType | undefined;
  toProvider: OnChainTradeType | undefined;
  bridgeProvider: CrossChainTradeType | BridgeType;
}
