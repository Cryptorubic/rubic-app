import { BridgeType, OnChainTradeType } from 'rubic-sdk';

export interface CrossChainRoute {
  fromProvider: OnChainTradeType | undefined;
  toProvider: OnChainTradeType | undefined;
  bridgeProvider: BridgeType;
}
