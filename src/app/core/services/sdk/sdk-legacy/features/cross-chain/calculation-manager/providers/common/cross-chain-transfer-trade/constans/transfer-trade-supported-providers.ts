import { CROSS_CHAIN_TRADE_TYPE } from '@cryptorubic/core';

export const transferTradeSupportedProviders = [
  CROSS_CHAIN_TRADE_TYPE.CHANGELLY,
  CROSS_CHAIN_TRADE_TYPE.CHANGENOW,
  CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP,
  CROSS_CHAIN_TRADE_TYPE.EXOLIX
];

export type TransferTradeSupportedProviders = (typeof transferTradeSupportedProviders)[number];
