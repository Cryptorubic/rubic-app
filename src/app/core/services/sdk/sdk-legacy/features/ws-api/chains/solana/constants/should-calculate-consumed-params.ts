import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType, ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '@cryptorubic/core';

export const shouldCalculateConsumedParamsProviders: (CrossChainTradeType | OnChainTradeType)[] = [
    CROSS_CHAIN_TRADE_TYPE.DEBRIDGE,
    ON_CHAIN_TRADE_TYPE.DLN,
    ON_CHAIN_TRADE_TYPE.DFLOW
];
