import { BridgeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { OnChainTradeType } from '@cryptorubic/core';

export type TradeProvider = OnChainTradeType | BridgeType;
