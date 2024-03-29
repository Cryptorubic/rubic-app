import { BRIDGE_TYPE, RubicTradeTypeForRango } from 'rubic-sdk';

export const RANGO_CROSS_CHAIN_DISABLED_PROVIDERS: RubicTradeTypeForRango[] = [
  BRIDGE_TYPE.RAINBOW,
  BRIDGE_TYPE.SYNAPSE,
  BRIDGE_TYPE.OPTIMISM_GATEWAY,
  BRIDGE_TYPE.ORBITER_BRIDGE,
  BRIDGE_TYPE.ARBITRUM_BRIDGE,
  BRIDGE_TYPE.IBC,
  BRIDGE_TYPE.SYMBIOSIS,
  BRIDGE_TYPE.OSMOSIS_BRIDGE,
  BRIDGE_TYPE.MAYA_PROTOCOL
];
