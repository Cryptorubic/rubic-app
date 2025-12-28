import { BridgeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { ProviderInfo } from '@features/trade/models/provider-info';

const imageBasePath = 'assets/images/icons/providers/bridge/';

export const BRIDGE_PROVIDERS: Record<BridgeType, ProviderInfo> = {
  //AAAAAAAAAAAAAAAAAAAA
  across: {
    averageTime: 5,
    color: '#6CF9D8',
    image: `${imageBasePath}across.svg`,
    name: 'Across'
  },
  allbridge: {
    averageTime: 5,
    color: '#5B978E',
    image: `${imageBasePath}allbridge.png`,
    name: 'Allbridge'
  },
  amarok: {
    averageTime: 5,
    color: '#5B76FD',
    image: `${imageBasePath}connext.svg`,
    name: 'Connext'
  },
  anyswap: {
    averageTime: 5,
    color: '#5F6BFB',
    image: `${imageBasePath}anyswap.svg`,
    name: 'AnySwap'
  },
  arbitrum: {
    averageTime: 5,
    color: '#1275b7',
    image: `${imageBasePath}arbitrum-bridge.svg`,
    name: 'Arbitrum Bridge'
  },
  archon_bridge: {
    averageTime: 5,
    color: '#000',
    image: `${imageBasePath}archon.svg`,
    name: 'Archon Bridge'
  },
  avalanche: {
    averageTime: 5,
    color: '#c2c2c2',
    image: `${imageBasePath}avalanche-bridge.svg`,
    name: 'Avalanche Bridge'
  },
  //BBBBBBBBBBBBBBB
  bridgers: {
    averageTime: 5,
    color: '#E6F3FF',
    image: `${imageBasePath}bridgers.png`,
    name: 'Bridgers'
  },
  //CCCCCCCCCCCCCCCCCCCC
  cbridge: {
    averageTime: 5,
    color: '#008aff',
    image: `${imageBasePath}celer.svg`,
    name: 'cBridge'
  },
  celer_bridge: {
    averageTime: 5,
    color: '#008aff',
    image: `${imageBasePath}cbridge.svg`,
    name: 'cBridge'
  },
  celercircle: {
    averageTime: 5,
    color: '#77E9C9',
    image: `${imageBasePath}celercircle.png`,
    name: 'CelerCircle'
  },
  celerim: {
    averageTime: 5,
    color: '#1682dc',
    image: `${imageBasePath}celerim.png`,
    name: 'Celerim'
  },
  changelly: {
    averageTime: 5,
    color: '#8e28fe',
    image: `${imageBasePath}changelly.svg`,
    name: 'Changelly'
  },
  changenow: {
    averageTime: 5,
    color: '#8888bb',
    image: `${imageBasePath}changenow.png`,
    name: 'ChangeNOW'
  },
  connext: {
    averageTime: 5,
    color: '#8e28fe',
    image: `${imageBasePath}connext.svg`,
    name: 'Connext'
  },
  //DDDDDDDDDDDDDDDD
  dln: {
    averageTime: 5,
    color: '#bf38ee',
    image: `${imageBasePath}debridge.svg`,
    name: 'deBridge'
  },
  //EEEEEEEEEEEEEEEE
  eddy_bridge: {
    averageTime: 5,
    color: 'black',
    image: 'assets/images/icons/providers/on-chain/eddyfinance.ico',
    name: 'Eddy Finance'
  },
  exolix: {
    averageTime: 5,
    color: 'black',
    image: `${imageBasePath}exolix.svg`,
    name: 'Exolix'
  },
  //GGGGGGGGGGGGGGGGG
  gnosis: {
    averageTime: 5,
    color: '#7F38A9',
    image: `${imageBasePath}gnosisbridge.png`,
    name: 'Gnosis Bridge'
  },
  //HHHHHHHHHH
  hop: {
    averageTime: 5,
    color: '#de7fb8',
    image: `${imageBasePath}hop.svg`,
    name: 'Hop'
  },
  hyphen: {
    averageTime: 5,
    color: '#353392',
    image: `${imageBasePath}hyphen.svg`,
    name: 'Hyphen'
  },
  //IIIIIIIIIIIIII
  ibc: {
    averageTime: 5,
    color: '#152042',
    image: `${imageBasePath}ibc.png`,
    name: 'IBC'
  },
  //LLLLLLLLLLLLLLLLL
  layerzero: {
    averageTime: 5,
    color: '#999999',
    image: `${imageBasePath}layerzero.svg`,
    name: 'LayerZero'
  },
  lifi: {
    averageTime: 5,
    color: '#bf38ee',
    image: `${imageBasePath}lifi.svg`,
    name: 'LiFi'
  },
  lifuel: {
    averageTime: 5,
    color: '#bf38ee',
    image: `${imageBasePath}lifuel.png`,
    name: 'Li Fuel'
  },
  //MMMMMMMMMMMMMMMMMMM
  maker: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}wormhole.svg`,
    name: `Maker's wormhole`
  },
  mayaprotocol: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}mayaprotocol.svg`,
    name: 'Maya Protocol'
  },
  meson: {
    averageTime: 5,
    color: '#29d5b0',
    image: `${imageBasePath}meson.svg`,
    name: 'Meson'
  },
  multichain: {
    averageTime: 5,
    color: '#452fbf',
    image: `${imageBasePath}multichain.png`,
    name: 'Multichain'
  },
  //NNNNNNNNNNNNNNNNNN
  near_intents: {
    averageTime: 5,
    color: '#452fbf',
    image: `assets/images/icons/coins/near.svg`,
    name: 'Near Intents'
  },
  //OOOOOOOOOOOOOOOOOO
  omni: {
    averageTime: 5,
    color: '#5CAAE8',
    image: `${imageBasePath}omnibridge.png`,
    name: 'Omni Bridge'
  },
  openocean: {
    averageTime: 5,
    color: '#15D9E1',
    image: `${imageBasePath}openocean.png`,
    name: 'Open Ocean'
  },
  optimism: {
    averageTime: 5,
    color: '#FF0420',
    image: `${imageBasePath}optimism-gateway.svg`,
    name: 'Optimism Gateway'
  },
  orbiter_bridge: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}orbiter.png`,
    name: 'Orbiter'
  },
  orbiter_bridge_v2: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}orbiter.png`,
    name: 'Orbiter V2'
  },
  osmosis: {
    averageTime: 5,
    color: '#5E12A0',
    image: `${imageBasePath}osmosis.svg`,
    name: 'Osmosis Bridge'
  },
  owl_to_bridge: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}owlto.svg`,
    name: 'Owlto'
  },
  //PPPPPPPPPPPPPPP
  polygon: {
    averageTime: 5,
    color: '#5d25ba',
    image: `${imageBasePath}polygon-bridge.png`,
    name: 'Polygon Bridge'
  },
  pulsechain_bridge: {
    averageTime: 5,
    color: '#fff',
    image: `assets/images/icons/coins/pulsechain.svg`,
    name: 'Pulsechain bridge'
  },
  //RRRRRRRRRRRRRRRRRRRR
  rainbow: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}rainbow.svg`,
    name: 'Rainbow Bridge'
  },
  rango: {
    averageTime: 5,
    color: 'blue',
    image: `${imageBasePath}rango.png`,
    name: 'Rango'
  },
  refuel: {
    averageTime: 5,
    color: '#FEA700',
    image: `${imageBasePath}refuel.png`,
    name: 'Refuel'
  },
  relay: {
    averageTime: 5,
    color: '#1F6BFF',
    image: `${imageBasePath}relay.svg`,
    name: 'Relay'
  },
  retro_bridge: {
    averageTime: 5,
    color: '#000000',
    image: `${imageBasePath}retro-bridge.svg`,
    name: 'Retro Bridge'
  },
  router: {
    averageTime: 5,
    color: '#000000',
    image: `${imageBasePath}router.svg`,
    name: 'Router'
  },
  rubic_stellar_api: {
    color: '#00ff73',
    image: 'assets/images/icons/providers/on-chain/rubic-stellar-api.svg',
    name: `Rubic's Stellar API`
  },
  //SSSSSSSSSSSSSSSSSSS
  satellite: {
    averageTime: 5,
    color: '#3C82F9',
    image: `${imageBasePath}satellite.svg`,
    name: 'Satellite'
  },
  scroll_bridge: {
    averageTime: 5,
    color: '#fff0de',
    image: `${imageBasePath}scroll.svg`,
    name: 'Scroll bridge'
  },
  simple_swap: {
    averageTime: 5,
    color: '#3C82F9',
    image: `${imageBasePath}simpleswap.png`,
    name: 'SimpleSwap'
  },
  squidrouter: {
    averageTime: 5,
    color: '#e6f936',
    image: `${imageBasePath}squidrouter.svg`,
    name: 'Squid Router'
  },
  stargate: {
    averageTime: 5,
    color: '#999999',
    image: `${imageBasePath}stargate.svg`,
    name: 'Stargate'
  },
  stargate_v2: {
    averageTime: 5,
    color: '#999999',
    image: `${imageBasePath}stargate.svg`,
    name: 'Stargate V2'
  },
  symbiosis: {
    averageTime: 5,
    color: '#0dc449',
    image: `${imageBasePath}symbiosis.png`,
    name: 'Symbiosis'
  },
  synapse: {
    averageTime: 5,
    color: '#b90aba',
    image: `${imageBasePath}synapse.svg`,
    name: 'Synapse'
  },
  //TTTTTTTTTTTTTTTTT
  taiko_bridge: {
    averageTime: 5,
    color: '#e81899',
    image: `${imageBasePath}taiko.svg`,
    name: 'Taiko Bridge'
  },
  tele_swap: {
    averageTime: 5,
    color: '#78FF39',
    image: `${imageBasePath}teleswap.svg`,
    name: 'TeleSwap'
  },
  thorchain: {
    averageTime: 5,
    color: '#33FF99',
    image: `${imageBasePath}thorchain.svg`,
    name: 'Thorchain'
  },
  //UUUUUUUUUUUUUUUUUUUUU
  unizen: {
    averageTime: 5,
    color: '#33FF99',
    image: `${imageBasePath}unizen.png`,
    name: 'Unizen'
  },
  //VVVVVVVVVVVVVVVVVVVVV
  voyager: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}voyager.svg`,
    name: 'Voyager'
  },
  //WWWWWWWWWWWWWWWWWWWW
  wanchain_bridge: {
    averageTime: 5,
    color: '#2a74db',
    image: 'assets/images/icons/coins/wanchain.svg',
    name: 'Wanchain Bridge'
  },
  wormhole: {
    averageTime: 5,
    color: 'white',
    image: `${imageBasePath}wormhole.svg`,
    name: 'Wormhole Mayan'
  },

  xflows: {
    averageTime: 5,
    color: '#1687ee',
    image: `${imageBasePath}xflows.svg`,
    name: 'Xflows'
  },
  //XXXXXXXXXXXXXXXXXX
  xy: {
    averageTime: 5,
    color: '#1687ee',
    image: `${imageBasePath}xy.svg`,
    name: 'XY'
  },
  //YYYYYYYYYYYYYYYYYYY
  ypool: {
    averageTime: 5,
    color: '#15D9E1',
    image: `${imageBasePath}ypool.svg`,
    name: 'YPool'
  }
};
