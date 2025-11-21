import { WrappedCrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { WrappedOnChainTradeOrNull } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';

export type WrappedSdkTrade = WrappedCrossChainTrade | Exclude<WrappedOnChainTradeOrNull, null>;
