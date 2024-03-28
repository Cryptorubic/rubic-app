import { BRIDGE_TYPE, BridgeType } from 'rubic-sdk';
import { ProviderInfo } from '@features/trade/models/provider-info';

const imageBasePath = 'assets/images/icons/providers/bridge/';

export const BRIDGE_PROVIDERS: Record<BridgeType, ProviderInfo> = {
  //AAAAAAAAAAAAAAAAAAAA
  [BRIDGE_TYPE.ACROSS]: {
    name: 'Across',
    image: `${imageBasePath}across.svg`,
    color: '#6CF9D8',
    averageTime: 5
  },
  [BRIDGE_TYPE.ALLBRIDGE]: {
    name: 'Allbridge',
    image: `${imageBasePath}allbridge.png`,
    color: '#5B978E',
    averageTime: 5
  },
  [BRIDGE_TYPE.ANY_SWAP]: {
    name: 'AnySwap',
    image: `${imageBasePath}anyswap.svg`,
    color: '#5F6BFB',
    averageTime: 5
  },
  [BRIDGE_TYPE.ARCHON_BRIDGE]: {
    name: 'Archon Bridge',
    image: `${imageBasePath}archon-bridge.svg`,
    color: '#1275b7',
    averageTime: 5
  },
  [BRIDGE_TYPE.ARBITRUM]: {
    name: 'Arbitrum Bridge',
    image: `${imageBasePath}arbitrum-bridge.svg`,
    color: '#1275b7',
    averageTime: 5
  },
  [BRIDGE_TYPE.AVALANCHE]: {
    name: 'Avalanche Bridge',
    image: `${imageBasePath}avalanche-bridge.svg`,
    color: '#c2c2c2',
    averageTime: 5
  },
  //BBBBBBBBBBBBBBB
  [BRIDGE_TYPE.BRIDGERS]: {
    name: 'Bridgers',
    image: `${imageBasePath}bridgers.png`,
    color: '#E6F3FF',
    averageTime: 5
  },
  //CCCCCCCCCCCCCCCCCCCC
  [BRIDGE_TYPE.CBRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}celer.svg`,
    color: '#008aff',
    averageTime: 5
  },
  [BRIDGE_TYPE.CELER_BRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}cbridge.svg`,
    color: '#008aff',
    averageTime: 5
  },
  [BRIDGE_TYPE.CELERIM]: {
    name: 'Celerim',
    image: `${imageBasePath}celerim.png`,
    color: '#1682dc',
    averageTime: 5
  },
  [BRIDGE_TYPE.CHANGENOW]: {
    name: 'ChangeNOW',
    image: `${imageBasePath}changenow.png`,
    color: '#8888bb',
    averageTime: 5
  },
  [BRIDGE_TYPE.CONNEXT_AMAROK]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#5B76FD',
    averageTime: 5
  },
  [BRIDGE_TYPE.CIRCLE_CELER_BRIDGE]: {
    name: 'CelerCircle',
    image: `${imageBasePath}celercircle.png`,
    color: '#77E9C9',
    averageTime: 5
  },
  [BRIDGE_TYPE.CONNEXT]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#8e28fe',
    averageTime: 5
  },
  //DDDDDDDDDDDDDDDD
  [BRIDGE_TYPE.DEBRIDGE]: {
    name: 'DLN',
    image: `${imageBasePath}debridge.svg`,
    color: '#bf38ee',
    averageTime: 5
  },
  //GGGGGGGGGGGGGGGGG
  [BRIDGE_TYPE.GNOSIS_BRIDGE]: {
    name: 'Gnosis Bridge',
    image: `${imageBasePath}gnosisbridge.png`,
    color: '#7F38A9',
    averageTime: 5
  },
  //HHHHHHHHHH
  [BRIDGE_TYPE.HOP]: {
    name: 'Hop',
    image: `${imageBasePath}hop.svg`,
    color: '#de7fb8',
    averageTime: 5
  },
  [BRIDGE_TYPE.HYPHEN]: {
    name: 'Hyphen',
    image: `${imageBasePath}hyphen.svg`,
    color: '#353392',
    averageTime: 5
  },
  //IIIIIIIIIIIIII
  [BRIDGE_TYPE.IBC]: {
    name: 'IBC',
    image: `${imageBasePath}ibc.png`,
    color: '#152042',
    averageTime: 5
  },
  //LLLLLLLLLLLLLLLLL
  [BRIDGE_TYPE.LAYERZERO]: {
    name: 'LayerZero',
    image: `${imageBasePath}layerzero.svg`,
    color: '#999999',
    averageTime: 5
  },
  [BRIDGE_TYPE.LIFI]: {
    name: 'LiFi',
    image: `${imageBasePath}lifi.svg`,
    color: '#bf38ee',
    averageTime: 5
  },
  [BRIDGE_TYPE.LI_FUEL]: {
    name: 'Li Fuel',
    image: `${imageBasePath}lifuel.png`,
    color: '#bf38ee',
    averageTime: 5
  },
  //MMMMMMMMMMMMMMMMMMM
  [BRIDGE_TYPE.MAKERS_WORMHOLE]: {
    name: `Maker's wormhole`,
    image: `${imageBasePath}wormhole.svg`,
    color: 'white',
    averageTime: 5
  },
  [BRIDGE_TYPE.MAYA_PROTOCOL]: {
    name: 'Maya Protocol',
    image: `${imageBasePath}mayaprotocol.svg`,
    color: 'white',
    averageTime: 5
  },
  [BRIDGE_TYPE.MULTICHAIN]: {
    name: 'Multichain',
    image: `${imageBasePath}multichain.png`,
    color: '#452fbf',
    averageTime: 5
  },
  //OOOOOOOOOOOOOOOOOO
  [BRIDGE_TYPE.OMNI_BRIDGE]: {
    name: 'Omni Bridge',
    image: `${imageBasePath}omnibridge.png`,
    color: '#5CAAE8',
    averageTime: 5
  },
  [BRIDGE_TYPE.OPEN_OCEAN]: {
    name: 'Open Ocean',
    image: `${imageBasePath}openocean.png`,
    color: '#15D9E1',
    averageTime: 5
  },
  [BRIDGE_TYPE.OPTIMISM_GATEWAY]: {
    name: 'Optimism Gateway',
    image: `${imageBasePath}optimism-gateway.svg`,
    color: '#FF0420',
    averageTime: 5
  },
  [BRIDGE_TYPE.ORBITER_BRIDGE]: {
    name: 'Orbiter',
    image: `${imageBasePath}orbiter.png`,
    color: 'white',
    averageTime: 5
  },
  [BRIDGE_TYPE.OSMOSIS_BRIDGE]: {
    name: 'Osmosis Bridge',
    image: `${imageBasePath}osmosis.svg`,
    color: '#5E12A0',
    averageTime: 5
  },
  //PPPPPPPPPPPPPPP
  [BRIDGE_TYPE.POLYGON]: {
    name: 'Polygon bridge',
    image: `${imageBasePath}polygon-bridge.png`,
    color: '#5d25ba',
    averageTime: 5
  },
  //RRRRRRRRRRRRRRRRRRRR
  [BRIDGE_TYPE.RAINBOW]: {
    name: 'Rainbow Bridge',
    image: `${imageBasePath}rainbow.svg`,
    color: 'white',
    averageTime: 5
  },
  [BRIDGE_TYPE.RANGO]: {
    name: 'Rango',
    image: `${imageBasePath}rango.png`,
    color: 'blue',
    averageTime: 5
  },
  [BRIDGE_TYPE.REFUEL]: {
    name: 'Refuel',
    image: `${imageBasePath}refuel.png`,
    color: '#FEA700',
    averageTime: 5
  },
  //SSSSSSSSSSSSSSSSSSS
  [BRIDGE_TYPE.SATELLITE]: {
    name: 'Satellite',
    image: `${imageBasePath}satellite.svg`,
    color: '#3C82F9',
    averageTime: 5
  },
  [BRIDGE_TYPE.SCROLL_BRIDGE]: {
    name: 'Scroll bridge',
    image: `${imageBasePath}scroll.svg`,
    color: '#fff0de',
    averageTime: 5
  },
  [BRIDGE_TYPE.SQUIDROUTER]: {
    name: 'Squid Router',
    image: `${imageBasePath}squidrouter.svg`,
    color: '#e6f936',
    averageTime: 5
  },
  [BRIDGE_TYPE.STARGATE]: {
    name: 'Stargate',
    image: `${imageBasePath}stargate.svg`,
    color: '#999999',
    averageTime: 5
  },
  [BRIDGE_TYPE.SYMBIOSIS]: {
    name: 'Symbiosis',
    image: `${imageBasePath}symbiosis.png`,
    color: '#0dc449',
    averageTime: 5
  },
  [BRIDGE_TYPE.SYNAPSE]: {
    name: 'Synapse',
    image: `${imageBasePath}synapse.svg`,
    color: '#b90aba',
    averageTime: 5
  },
  //TTTTTTTTTTTTTTTTT
  [BRIDGE_TYPE.TAIKO_BRIDGE]: {
    name: 'Taiko bridge',
    image: `${imageBasePath}taiko.svg`,
    color: '#e81899',
    averageTime: 5
  },
  [BRIDGE_TYPE.THORCHAIN]: {
    name: 'Thorchain',
    image: `${imageBasePath}thorchain.svg`,
    color: '#33FF99',
    averageTime: 5
  },
  //VVVVVVVVVVVVVVVVVVVVV
  [BRIDGE_TYPE.VOYAGER]: {
    name: 'Voyager',
    image: `${imageBasePath}voyager.svg`,
    color: 'white',
    averageTime: 5
  },
  //WWWWWWWWWWWWWWWWWWWW
  [BRIDGE_TYPE.WORMHOLE]: {
    name: 'Wormhole',
    image: `${imageBasePath}wormhole.svg`,
    color: 'white',
    averageTime: 5
  },
  //XXXXXXXXXXXXXXXXXX
  [BRIDGE_TYPE.XY]: {
    name: 'XY',
    image: `${imageBasePath}xy.svg`,
    color: '#1687ee',
    averageTime: 5
  },
  //YYYYYYYYYYYYYYYYYYY
  [BRIDGE_TYPE.YPOOL]: {
    name: 'YPool',
    image: `${imageBasePath}ypool.svg`,
    color: '#15D9E1',
    averageTime: 5
  },
  [BRIDGE_TYPE.PULSE_CHAIN_BRIDGE]: {
    name: 'Pulsechain bridge',
    image: `assets/images/icons/coins/pulsechain.svg`,
    color: '#fff',
    averageTime: 5
  }
};
