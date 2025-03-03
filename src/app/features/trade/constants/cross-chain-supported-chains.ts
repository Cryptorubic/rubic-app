import {
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  bridgersCrossChainSupportedBlockchains,
  changenowProxySupportedBlockchains,
  eddyBridgeSupportedChains,
  lifiCrossChainSupportedBlockchains,
  mesonCrossChainSupportedChains,
  orbiterSupportedBlockchains,
  rangoSupportedBlockchains,
  scrollBridgeSupportedBlockchains,
  symbiosisCrossChainSupportedBlockchains,
  routerCrossChainSupportedChains,
  retroBridgeSupportedBlockchain
} from 'rubic-sdk';

export const CROSS_CHAIN_SUPPORTED_CHAINS_CONFIG: Record<
  Exclude<CrossChainTradeType, 'multichain'>,
  Readonly<BlockchainName[]>
> = {
  [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: symbiosisCrossChainSupportedBlockchains,
  [CROSS_CHAIN_TRADE_TYPE.LIFI]: lifiCrossChainSupportedBlockchains,
  [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: [],
  [CROSS_CHAIN_TRADE_TYPE.BRIDGERS]: bridgersCrossChainSupportedBlockchains,
  [CROSS_CHAIN_TRADE_TYPE.XY]: [],
  [CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE]: [],
  [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: changenowProxySupportedBlockchains,
  [CROSS_CHAIN_TRADE_TYPE.STARGATE]: [],
  [CROSS_CHAIN_TRADE_TYPE.ARBITRUM]: [],
  [CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER]: [],
  [CROSS_CHAIN_TRADE_TYPE.SCROLL_BRIDGE]: scrollBridgeSupportedBlockchains,
  [CROSS_CHAIN_TRADE_TYPE.TAIKO_BRIDGE]: [],
  [CROSS_CHAIN_TRADE_TYPE.RANGO]: rangoSupportedBlockchains,
  [CROSS_CHAIN_TRADE_TYPE.PULSE_CHAIN_BRIDGE]: [],
  [CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE]: orbiterSupportedBlockchains,
  [CROSS_CHAIN_TRADE_TYPE.LAYERZERO]: [],
  [CROSS_CHAIN_TRADE_TYPE.ARCHON_BRIDGE]: [],
  [CROSS_CHAIN_TRADE_TYPE.MESON]: mesonCrossChainSupportedChains,
  [CROSS_CHAIN_TRADE_TYPE.OWL_TO_BRIDGE]: [],
  [CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE]: eddyBridgeSupportedChains,
  [CROSS_CHAIN_TRADE_TYPE.STARGATE_V2]: [],
  [CROSS_CHAIN_TRADE_TYPE.ROUTER]: routerCrossChainSupportedChains,
  [CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE]: retroBridgeSupportedBlockchain,
  [CROSS_CHAIN_TRADE_TYPE.ACROSS]: [],
  [CROSS_CHAIN_TRADE_TYPE.UNIZEN]: [],
  [CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP]: [],
  [CROSS_CHAIN_TRADE_TYPE.CHANGELLY]: []
} as const;
