import { BRIDGE_TYPE, BridgeType } from 'rubic-sdk';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';

const imageBasePath = 'assets/images/icons/providers/bridge/';

export const BRIDGE_PROVIDERS: Record<BridgeType, ProviderInfo> = {
  [BRIDGE_TYPE.ACROSS]: {
    name: 'Across',
    image: `${imageBasePath}across.svg`,
    color: '#6CF9D8'
  },
  [BRIDGE_TYPE.ALLBRIDGE]: {
    name: 'Allbridge',
    image: `${imageBasePath}allbridge.png`,
    color: '#5B978E'
  },
  [BRIDGE_TYPE.AMAROK]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#5B76FD'
  },
  [BRIDGE_TYPE.ANY_SWAP]: {
    name: 'AnySwap',
    image: `${imageBasePath}anyswap.svg`,
    color: '#5F6BFB'
  },
  [BRIDGE_TYPE.ARBITRUM]: {
    name: 'Arbitrum Bridge',
    image: `${imageBasePath}arbitrum-bridge.svg`,
    color: '#1275b7'
  },
  [BRIDGE_TYPE.AVALANCHE]: {
    name: 'Avalanche Bridge',
    image: `${imageBasePath}avalanche-bridge.svg`,
    color: '#c2c2c2'
  },

  [BRIDGE_TYPE.BRIDGERS]: {
    name: 'Bridgers',
    image: `${imageBasePath}bridgers.png`,
    color: '#E6F3FF'
  },

  [BRIDGE_TYPE.CBRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}celer.svg`,
    color: '#008aff'
  },
  [BRIDGE_TYPE.CELER_BRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}celer.svg`,
    color: '#008aff'
  },
  [BRIDGE_TYPE.CONNEXT_AMAROK]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#5B76FD'
  },
  [BRIDGE_TYPE.CIRCLE_CELER_BRIDGE]: {
    name: 'CelerCircle',
    image: `${imageBasePath}celercircle.png`,
    color: '#77E9C9'
  },
  [BRIDGE_TYPE.CONNEXT]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#8e28fe'
  },

  [BRIDGE_TYPE.DEBRIDGE]: {
    name: 'DLN',
    image: `${imageBasePath}debridge.svg`,
    color: '#bf38ee'
  },

  [BRIDGE_TYPE.GNOSIS_BRIDGE]: {
    name: 'Gnosis Bridge',
    image: `${imageBasePath}gnosisbridge.png`,
    color: '#7F38A9'
  },

  [BRIDGE_TYPE.HOP]: {
    name: 'Hop',
    image: `${imageBasePath}hop.svg`,
    color: '#de7fb8'
  },
  [BRIDGE_TYPE.HYPHEN]: {
    name: 'Hyphen',
    image: `${imageBasePath}hyphen.svg`,
    color: '#353392'
  },

  [BRIDGE_TYPE.CHANGENOW]: {
    name: 'CN',
    image: `${imageBasePath}changenow.png`,
    color: '#8888bb'
  },

  [BRIDGE_TYPE.LIFI]: {
    name: 'Lifi',
    image: `${imageBasePath}lifi.svg`,
    color: '#bf38ee'
  },
  [BRIDGE_TYPE.LI_FUEL]: {
    name: 'Li Fuel',
    image: `${imageBasePath}lifuel.png`,
    color: '#bf38ee'
  },

  [BRIDGE_TYPE.MAKERS_WORMHOLE]: {
    name: `Maker's wormhole`,
    image: `${imageBasePath}wormhole.svg`,
    color: 'white'
  },
  [BRIDGE_TYPE.MULTICHAIN]: {
    name: 'Multichain',
    image: `${imageBasePath}multichain.png`,
    color: '#452fbf'
  },

  [BRIDGE_TYPE.OPTIMISM_GATEWAY]: {
    name: 'Optimism Gateway',
    image: `${imageBasePath}optimism-gateway.svg`,
    color: '#FF0420'
  },
  [BRIDGE_TYPE.OSMOSIS_BRIDGE]: {
    name: 'Osmosis Bridge',
    image: `${imageBasePath}osmosis.svg`,
    color: '#5E12A0'
  },

  [BRIDGE_TYPE.POLYGON]: {
    name: 'Polygon bridge',
    image: `${imageBasePath}polygon-bridge.png`,
    color: '#5d25ba'
  },
  [BRIDGE_TYPE.POLYGON_BRIDGE]: {
    name: 'Polygon bridge',
    image: `${imageBasePath}polygon-bridge.png`,
    color: '#5d25ba'
  },

  [BRIDGE_TYPE.REFUEL]: {
    name: 'Refuel',
    image: `${imageBasePath}refuel.png`,
    color: '#FEA700'
  },

  [BRIDGE_TYPE.SATELLITE]: {
    name: 'Satellite',
    image: `${imageBasePath}satellite.svg`,
    color: '#3C82F9'
  },
  [BRIDGE_TYPE.STARGATE]: {
    name: 'Stargate',
    image: `${imageBasePath}stargate.svg`,
    color: '#999999'
  },
  [BRIDGE_TYPE.SYMBIOSIS]: {
    name: 'Symbiosis',
    image: `${imageBasePath}symbiosis.png`,
    color: '#0dc449'
  },
  [BRIDGE_TYPE.SYNAPSE]: {
    name: 'Synapse',
    image: `${imageBasePath}synapse.svg`,
    color: '#b90aba'
  },

  [BRIDGE_TYPE.THORCHAIN]: {
    name: 'Thorchain',
    image: `${imageBasePath}thorchain.svg`,
    color: '#33FF99'
  },

  [BRIDGE_TYPE.WORMHOLE]: {
    name: 'Wormhole',
    image: `${imageBasePath}wormhole.svg`,
    color: 'white'
  },

  [BRIDGE_TYPE.YPOOL]: {
    name: 'YPool',
    image: `${imageBasePath}ypool.svg`,
    color: '#15D9E1'
  },
  [BRIDGE_TYPE.OPEN_OCEAN]: {
    name: 'Open Ocean',
    image: `${imageBasePath}openocean.png`,
    color: '#15D9E1'
  },
  [BRIDGE_TYPE.OMNI_BRIDGE]: {
    name: 'Omni Bridge',
    image: `${imageBasePath}omnibridge.png`,
    color: '#5CAAE8'
  },
  [BRIDGE_TYPE.XY]: {
    name: 'XY',
    image: `${imageBasePath}xy.svg`,
    color: '#1687ee'
  },
  [BRIDGE_TYPE.CELER_BRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}cbridge.svg`,
    color: '#008aff'
  },
  [BRIDGE_TYPE.SQUIDROUTER]: {
    name: 'Squid Router',
    image: `${imageBasePath}squidrouter.svg`,
    color: '#e6f936'
  },
  [BRIDGE_TYPE.SCROLL_BRIDGE]: {
    name: 'Scroll bridge',
    image: `${imageBasePath}scroll.svg`,
    color: '#fff0de'
  },
  [BRIDGE_TYPE.CELERIM]: {
    name: 'Celerim',
    image: `${imageBasePath}celerim.png`,
    color: '#1682dc'
  }
};
