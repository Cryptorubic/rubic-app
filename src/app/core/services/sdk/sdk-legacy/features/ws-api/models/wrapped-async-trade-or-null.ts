import { CrossChainTradeType, OnChainTradeType } from '@cryptorubic/core';
import { WrappedCrossChainTradeOrNull } from '../../cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { WrappedOnChainTradeOrNull } from '../../on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';

export interface WrappedAsyncTradeOrNull {
  total: number;
  calculated: number;
  wrappedTrade: WrappedCrossChainTradeOrNull | WrappedOnChainTradeOrNull;
  tradeType?: CrossChainTradeType | OnChainTradeType;
}
