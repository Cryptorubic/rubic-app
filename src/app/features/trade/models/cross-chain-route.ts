import { BridgeType, OnChainTradeType } from '@cryptorubic/sdk';

export interface CrossChainRoute {
  fromProvider: OnChainTradeType | undefined;
  toProvider: OnChainTradeType | undefined;
  bridgeProvider: BridgeType;
}
