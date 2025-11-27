import { BridgeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { OnChainTradeType } from '@cryptorubic/core';

export interface CrossChainRoute {
  fromProvider: OnChainTradeType | undefined;
  toProvider: OnChainTradeType | undefined;
  bridgeProvider: BridgeType;
}
