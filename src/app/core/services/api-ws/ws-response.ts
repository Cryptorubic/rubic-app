import { CrossChainTradeType, OnChainTradeType } from 'rubic-sdk';
import { Route } from '@cryptorubic/sdk-core';

export interface WsResponse {
  calculated: number;
  total: number;
  trade: Route;
  type: CrossChainTradeType | OnChainTradeType;
}
