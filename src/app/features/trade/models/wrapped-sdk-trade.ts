import { WrappedCrossChainTrade, WrappedOnChainTradeOrNull } from '@cryptorubic/sdk';

export type WrappedSdkTrade = WrappedCrossChainTrade | Exclude<WrappedOnChainTradeOrNull, null>;
