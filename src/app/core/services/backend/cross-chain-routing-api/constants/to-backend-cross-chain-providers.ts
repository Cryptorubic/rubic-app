import { CrossChainTradeType, CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk';

const toProviders = {
  [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: 'symbiosis',
  [CROSS_CHAIN_TRADE_TYPE.LIFI]: 'lifi',
  [CROSS_CHAIN_TRADE_TYPE.BRIDGERS]: 'bridgers',
  [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: 'dln',
  [CROSS_CHAIN_TRADE_TYPE.MULTICHAIN]: 'multichain',
  [CROSS_CHAIN_TRADE_TYPE.XY]: 'xy',
  [CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE]: 'celer_bridge',
  [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: 'changenow',
  [CROSS_CHAIN_TRADE_TYPE.STARGATE]: 'stargate',
  [CROSS_CHAIN_TRADE_TYPE.ARBITRUM]: 'rbc_arbitrum_bridge',
  [CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER]: 'squidrouter',
  [CROSS_CHAIN_TRADE_TYPE.SCROLL_BRIDGE]: 'scroll_bridge',
  [CROSS_CHAIN_TRADE_TYPE.TAIKO_BRIDGE]: 'taiko_bridge'
} as const;

export const TO_BACKEND_CROSS_CHAIN_PROVIDERS: Record<CrossChainTradeType, string> = {
  ...toProviders
};

export type ToBackendCrossChainProviders = (typeof toProviders)[keyof typeof toProviders];
