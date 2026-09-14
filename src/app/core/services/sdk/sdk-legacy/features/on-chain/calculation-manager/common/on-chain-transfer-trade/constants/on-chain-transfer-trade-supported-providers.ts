import { ON_CHAIN_TRADE_TYPE } from '@cryptorubic/core';

export const onChainTransferTradeSupportedProviders = [
  ON_CHAIN_TRADE_TYPE.CLEARSWAP,
  ON_CHAIN_TRADE_TYPE.HOUDINI
] as const;

export type OnChainTransferTradeType = (typeof onChainTransferTradeSupportedProviders)[number];
