import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'rubic-sdk';

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
  [CROSS_CHAIN_TRADE_TYPE.SCROLL_BRIDGE]: 'scroll_sepolia',
  [CROSS_CHAIN_TRADE_TYPE.TAIKO_BRIDGE]: 'taiko_bridge',
  [CROSS_CHAIN_TRADE_TYPE.RANGO]: 'rango',
  [CROSS_CHAIN_TRADE_TYPE.PULSE_CHAIN_BRIDGE]: 'pulsechain_bridge',
  [CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE]: 'orbiter_bridge',
  [CROSS_CHAIN_TRADE_TYPE.LAYERZERO]: 'layerzero',
  [CROSS_CHAIN_TRADE_TYPE.ARCHON_BRIDGE]: 'archon_bridge',
  [CROSS_CHAIN_TRADE_TYPE.MESON]: 'meson',
  [CROSS_CHAIN_TRADE_TYPE.OWL_TO_BRIDGE]: 'owl_to_bridge',
  [CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE]: 'eddy_bridge',
  [CROSS_CHAIN_TRADE_TYPE.STARGATE_V2]: 'stargate_v2',
  [CROSS_CHAIN_TRADE_TYPE.ROUTER]: 'router',
  [CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE]: 'retro_bridge'
} as const;

export const TO_BACKEND_CROSS_CHAIN_PROVIDERS: Record<CrossChainTradeType, string> = {
  ...toProviders
};

export type ToBackendCrossChainProviders = (typeof toProviders)[keyof typeof toProviders];
