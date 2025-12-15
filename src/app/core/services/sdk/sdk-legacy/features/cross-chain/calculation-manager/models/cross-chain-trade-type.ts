import {
  CROSS_CHAIN_TRADE_TYPE as RUBIC_CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType as RubicCrossChainTradeType
} from '@cryptorubic/core';

const { MULTICHAIN: _, ...rest } = RUBIC_CROSS_CHAIN_TRADE_TYPE;
export const CROSS_CHAIN_TRADE_TYPE = rest;
export type CrossChainTradeType = Exclude<RubicCrossChainTradeType, 'multichain'>;
