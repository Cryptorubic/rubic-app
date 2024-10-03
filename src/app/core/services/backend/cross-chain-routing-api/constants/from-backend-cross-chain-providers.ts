import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'rubic-sdk';
import { ToBackendCrossChainProviders } from '@core/services/backend/cross-chain-routing-api/constants/to-backend-cross-chain-providers';

export const FROM_BACKEND_CROSS_CHAIN_PROVIDERS: Record<
  ToBackendCrossChainProviders,
  CrossChainTradeType
> = {
  symbiosis: CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS,
  lifi: CROSS_CHAIN_TRADE_TYPE.LIFI,
  bridgers: CROSS_CHAIN_TRADE_TYPE.BRIDGERS,
  dln: CROSS_CHAIN_TRADE_TYPE.DEBRIDGE,
  multichain: CROSS_CHAIN_TRADE_TYPE.MULTICHAIN,
  celer_bridge: CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE,
  changenow: CROSS_CHAIN_TRADE_TYPE.CHANGENOW,
  xy: CROSS_CHAIN_TRADE_TYPE.XY,
  rbc_arbitrum_bridge: CROSS_CHAIN_TRADE_TYPE.ARBITRUM,
  stargate: CROSS_CHAIN_TRADE_TYPE.STARGATE,
  squidrouter: CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER,
  scroll_sepolia: CROSS_CHAIN_TRADE_TYPE.SCROLL_BRIDGE,
  taiko_bridge: CROSS_CHAIN_TRADE_TYPE.TAIKO_BRIDGE,
  rango: CROSS_CHAIN_TRADE_TYPE.RANGO,
  pulsechain_bridge: CROSS_CHAIN_TRADE_TYPE.PULSE_CHAIN_BRIDGE,
  orbiter_bridge: CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE,
  layerzero: CROSS_CHAIN_TRADE_TYPE.LAYERZERO,
  archon_bridge: CROSS_CHAIN_TRADE_TYPE.ARCHON_BRIDGE,
  meson: CROSS_CHAIN_TRADE_TYPE.MESON,
  owl_to_bridge: CROSS_CHAIN_TRADE_TYPE.OWL_TO_BRIDGE,
  eddy_bridge: CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE,
  stargate_v2: CROSS_CHAIN_TRADE_TYPE.STARGATE_V2,
  router: CROSS_CHAIN_TRADE_TYPE.ROUTER,
  across: CROSS_CHAIN_TRADE_TYPE.ACROSS
};
