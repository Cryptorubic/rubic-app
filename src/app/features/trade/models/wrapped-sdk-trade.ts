import { WrappedCrossChainTrade, WrappedOnChainTradeOrNull } from 'rubic-sdk';

export type WrappedSdkTrade = WrappedCrossChainTrade | Exclude<WrappedOnChainTradeOrNull, null>;
