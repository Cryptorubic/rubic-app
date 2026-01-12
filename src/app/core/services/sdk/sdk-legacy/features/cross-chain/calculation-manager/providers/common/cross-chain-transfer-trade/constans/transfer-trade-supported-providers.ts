import { CROSS_CHAIN_TRADE_TYPE } from '@cryptorubic/core';

export const transferTradeSupportedProviders = [
  CROSS_CHAIN_TRADE_TYPE.CHANGENOW,
  CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP,
  CROSS_CHAIN_TRADE_TYPE.CHANGELLY,
  CROSS_CHAIN_TRADE_TYPE.EXOLIX,
  CROSS_CHAIN_TRADE_TYPE.NEAR_INTENTS,
  CROSS_CHAIN_TRADE_TYPE.QUICKEX,
  CROSS_CHAIN_TRADE_TYPE.HOUDINI
] as const;

export type TransferTradeType = (typeof transferTradeSupportedProviders)[number];
