import { BridgeType, CrossChainTradeType, OnChainTradeType } from 'rubic-sdk';

export interface CrossChainRoute {
  fromProvider: OnChainTradeType | undefined;
  toProvider: OnChainTradeType | undefined;
  bridgeProvider: CrossChainTradeType | BridgeType;
}
