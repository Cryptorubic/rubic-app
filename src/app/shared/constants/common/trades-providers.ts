import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { TableProvider } from '@shared/models/my-trades/table-trade';
import {
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  TRADE_TYPE,
  TradeType,
  BRIDGE_TYPE,
  BridgeType
} from 'rubic-sdk';

export type Provider = {
  name: string;
  image: string;
  color?: string;
};

const imageBasePath = 'assets/images/icons/providers/';

const BRIDGE_PROVIDERS: Record<BRIDGE_PROVIDER, Provider> = {
  [BRIDGE_PROVIDER.SWAP_RBC]: {
    name: 'Rubic',
    image: `${imageBasePath}rubic.svg`
  },
  [BRIDGE_PROVIDER.POLYGON]: {
    name: 'Polygon',
    image: `${imageBasePath}polygon.svg`
  }
};

const INSTANT_TRADES_PROVIDER: Record<TradeType, Provider> = {
  [TRADE_TYPE.UNI_SWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.svg`,
    color: '#FD017A'
  },
  [TRADE_TYPE.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`,
    color: '#F9DBEA'
  },
  [TRADE_TYPE.ONE_INCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [TRADE_TYPE.PANCAKE_SWAP]: {
    name: 'Pancakeswap',
    image: `${imageBasePath}pancakeswap.svg`,
    color: '#00ADE8'
  },
  [TRADE_TYPE.QUICK_SWAP]: {
    name: 'Quickswap',
    image: `${imageBasePath}quickswap.svg`,
    color: '#5389C5'
  },
  [TRADE_TYPE.SUSHI_SWAP]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`,
    color: '#FC5408;'
  },
  [TRADE_TYPE.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`,
    color: '#6665DD'
  },
  [TRADE_TYPE.SPOOKY_SWAP]: {
    name: 'Spookyswap',
    image: `${imageBasePath}spookyswap.png`,
    color: '#59C3C8'
  },
  [TRADE_TYPE.SPIRIT_SWAP]: {
    name: 'Spiritswap',
    image: `${imageBasePath}spiritswap.png`,
    color: '#59C3C8'
  },
  [TRADE_TYPE.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`,
    color: '#FFFFFF'
  },
  [TRADE_TYPE.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.png`,
    color: '#FFFFFF'
  },
  [TRADE_TYPE.SOLAR_BEAM]: {
    name: 'Solarbeam',
    image: `${imageBasePath}solarbeam.png`,
    color: '#F2A272'
  },
  [TRADE_TYPE.RAYDIUM]: {
    name: 'Raydium',
    image: `${imageBasePath}raydium.svg`,
    color: '#3875FD'
  },
  [TRADE_TYPE.REF_FINANCE]: {
    name: 'Ref Finance',
    image: `${imageBasePath}ref-finance.svg`
  },
  [TRADE_TYPE.ALGEBRA]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.webp`,
    color: '#00CAB2'
  },
  [TRADE_TYPE.VIPER_SWAP]: {
    name: 'Viper',
    image: `${imageBasePath}viperswap.svg`,
    color: '#00805C'
  },
  [TRADE_TYPE.TRISOLARIS]: {
    name: 'Trisolaris',
    image: `${imageBasePath}trisolaris.svg`,
    color: '#00F4FF'
  },
  [TRADE_TYPE.WANNA_SWAP]: {
    name: 'Wannaswap',
    image: `${imageBasePath}wannaswap.svg`,
    color: '#FACB5B'
  },
  [TRADE_TYPE.ZAPPY]: {
    name: 'Zappy',
    image: `${imageBasePath}zappy.svg`,
    color: '#00e7e7'
  },
  [TRADE_TYPE.PARA_SWAP]: {
    name: 'Paraswap',
    image: `${imageBasePath}paraswap.svg`,
    color: '#2e58b0'
  },
  [TRADE_TYPE.OPEN_OCEAN]: {
    name: 'Open Ocean',
    image: `${imageBasePath}open-ocean.png`,
    color: ''
  },
  [TRADE_TYPE.DODO]: {
    name: 'Dodo',
    image: `${imageBasePath}dodo.png`,
    color: '#efc20b'
  },
  [TRADE_TYPE.HONEY_SWAP]: {
    name: 'Honeyswap',
    image: `${imageBasePath}honeyswap.webp`,
    color: '#efc20b'
  },
  [TRADE_TYPE.STELLA_SWAP]: {
    name: 'Stellaswap',
    image: `${imageBasePath}stellaswap.svg`,
    color: '#E2107B'
  },
  [TRADE_TYPE.BEAM_SWAP]: {
    name: 'Beamswap',
    image: `${imageBasePath}beamswap.png`,
    color: '#26B7F0'
  },
  [TRADE_TYPE.UBE_SWAP]: {
    name: 'Ubeswap',
    image: `${imageBasePath}ubeswap.svg`,
    color: '#6D619A'
  },
  [TRADE_TYPE.J_SWAP]: {
    name: 'Jswap',
    image: `${imageBasePath}jswap.jpg`,
    color: '#5b55e3'
  },
  [TRADE_TYPE.CRONA_SWAP]: {
    name: 'Cronaswap',
    image: `${imageBasePath}cronaswap.webp`,
    color: '#020426'
  },
  [TRADE_TYPE.AURORA_SWAP]: {
    name: 'Auroraswap',
    image: '',
    color: ''
  },
  [TRADE_TYPE.MM_FINANCE]: {
    name: 'MMFinance',
    image: '',
    color: ''
  },
  [TRADE_TYPE.VVS_FINANCE]: {
    name: 'VVSFinance',
    image: '',
    color: ''
  },
  [TRADE_TYPE.VOLTAGE_SWAP]: {
    name: 'Voltageswap',
    image: '',
    color: ''
  },
  [TRADE_TYPE.JUPITER]: {
    name: 'Jupiter',
    image: '',
    color: ''
  },
  OOLONG_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  ACRYPTOS: {
    name: '',
    image: '',
    color: ''
  },
  ALDRIN_EXCHANGE: {
    name: '',
    image: '',
    color: ''
  },
  ANNEX: {
    name: '',
    image: '',
    color: ''
  },
  APE_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  ARTH_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  BABY_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  BALANCER: {
    name: '',
    image: '',
    color: ''
  },
  BI_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  CREMA_FINANCE: {
    name: '',
    image: '',
    color: ''
  },
  CROPPER_FINANCE: {
    name: '',
    image: '',
    color: ''
  },
  CROW_FI: {
    name: '',
    image: '',
    color: ''
  },
  CRO_DEX: {
    name: '',
    image: '',
    color: ''
  },
  CURVE: {
    name: '',
    image: '',
    color: ''
  },
  DEFI_PLAZA: {
    name: '',
    image: '',
    color: ''
  },
  DEFI_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  DFYN: {
    name: '',
    image: '',
    color: ''
  },
  DYSTOPIA: {
    name: '',
    image: '',
    color: ''
  },
  JET_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  KYBER_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  LUA_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  MAVERICK: {
    name: '',
    image: '',
    color: ''
  },
  MDEX: {
    name: '',
    image: '',
    color: ''
  },
  MESH_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  MOJITO_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  ONE_MOON: {
    name: '',
    image: '',
    color: ''
  },
  ONE_SOL: {
    name: '',
    image: '',
    color: ''
  },
  ORCA_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  OSMOSIS_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  POLYDEX: {
    name: '',
    image: '',
    color: ''
  },
  SABER_STABLE_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  SAROS_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  SERUM: {
    name: '',
    image: '',
    color: ''
  },
  SHIBA_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  SMOOTHY: {
    name: '',
    image: '',
    color: ''
  },
  SPL_TOKEN_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  WAULT_SWAP: {
    name: '',
    image: '',
    color: ''
  },
  WOO_FI: {
    name: '',
    image: '',
    color: ''
  },
  ZIP_SWAP: {
    name: '',
    image: '',
    color: ''
  }
};

const CROSS_CHAIN_TRADE_PROVIDER: Record<CrossChainTradeType, Provider> = {
  [CROSS_CHAIN_TRADE_TYPE.RUBIC]: {
    name: 'Rubic',
    image: ''
  },
  [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: {
    name: 'Symbiosis',
    image: `${imageBasePath}symbiosis.png`,
    color: '#0dc449'
  },
  [CROSS_CHAIN_TRADE_TYPE.LIFI]: {
    name: 'Lifi',
    image: ''
  },
  [CROSS_CHAIN_TRADE_TYPE.CELER]: {
    name: 'Celer',
    image: `${imageBasePath}celer.svg`,
    color: 'white'
  },
  [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: {
    name: 'DeBridge',
    image: `${imageBasePath}debridge.svg`,
    color: '#bf38ee'
  },
  [CROSS_CHAIN_TRADE_TYPE.RANGO]: {
    name: 'Rango',
    image: `${imageBasePath}debridge.svg`,
    color: '#bf38ee'
  },
  [CROSS_CHAIN_TRADE_TYPE.VIA]: {
    name: '',
    image: '',
    color: ''
  }
};

// export const RANGO_BRIDGE_PROVIDER: Record<RangoTradeSubtype, Provider> = {
//   [RANGO_TRADE_SUBTYPE.ACROSS]: {
//     name: 'Across',
//     image: `${imageBasePath}across.svg`,
//     color: '#29a98b'
//   },
//   [RANGO_TRADE_SUBTYPE.ARBITRUM_BRIDGE]: {
//     name: 'Arbitrum Bridge',
//     image: `${imageBasePath}arbitrum-bridge.svg`,
//     color: '#1275b7'
//   },
//   [RANGO_TRADE_SUBTYPE.AVALANCHE_BRIDGE]: {
//     name: 'Avalanche Bridge',
//     image: `${imageBasePath}avalanche-bridge.svg`,
//     color: '#323232'
//   },
//   [RANGO_TRADE_SUBTYPE.CELER_BRIDGE]: {
//     name: 'cBridge',
//     image: `${imageBasePath}celer.svg`,
//     color: 'white'
//   },
//   [RANGO_TRADE_SUBTYPE.HOP]: {
//     name: 'Hop',
//     image: `${imageBasePath}hop.svg`,
//     color: '#de7fb8'
//   },
//   [RANGO_TRADE_SUBTYPE.HYPHEN]: {
//     name: 'Hyphen',
//     image: `${imageBasePath}hyphen.svg`,
//     color: '#353392'
//   },
//   [RANGO_TRADE_SUBTYPE.OPTIMISM_BRIDGE]: {
//     name: 'Optimism Gateway',
//     image: `${imageBasePath}optimism-gateway.svg`,
//     color: 'white'
//   },
//   [RANGO_TRADE_SUBTYPE.STARGATE]: {
//     name: 'Stargate',
//     image: `${imageBasePath}stargate.svg`,
//     color: 'grey'
//   },
//   [RANGO_TRADE_SUBTYPE.ANYSWAP_AGGREGATOR]: {
//     name: 'Anyswap Aggregator',
//     image: '${imageBasePath}stargate.svg',
//     color: 'grey'
//   },
//   [RANGO_TRADE_SUBTYPE.ANYSWAP_BRIDGE]: {
//     name: 'Anyswap Bridge',
//     image: '${imageBasePath}stargate.svg',
//     color: 'grey'
//   },
//   [RANGO_TRADE_SUBTYPE.CBRIDGE_AGGREGATOR]: {
//     name: 'Cbridge Aggregator',
//     image: '${imageBasePath}stargate.svg',
//     color: 'grey'
//   },
//   [RANGO_TRADE_SUBTYPE.OPENOCEAN]: {
//     name: 'Openocean',
//     image: '${imageBasePath}stargate.svg',
//     color: 'grey'
//   }
// };

export const BRIDGE_TYPE_PROVIDERS: Record<BridgeType, Provider> = {
  [BRIDGE_TYPE.ACROSS]: {
    name: 'Across',
    image: `${imageBasePath}across.svg`,
    color: '#29a98b'
  },
  [BRIDGE_TYPE.ARBITRUM_BRIDGE]: {
    name: 'Arbitrum Bridge',
    image: `${imageBasePath}arbitrum-bridge.svg`,
    color: '#1275b7'
  },
  [BRIDGE_TYPE.AVALANCHE_BRIDGE]: {
    name: 'Avalanche Bridge',
    image: `${imageBasePath}avalanche-bridge.svg`,
    color: '#323232'
  },
  [BRIDGE_TYPE.CELER_BRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}celer.svg`,
    color: 'white'
  },
  [BRIDGE_TYPE.CONNEXT]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#8e28fe'
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
    color: 'white'
  },
  [BRIDGE_TYPE.POLYGON]: {
    name: 'Polygon bridge',
    image: `${imageBasePath}polygon-bridge.png`,
    color: '#5d25ba'
  },
  [BRIDGE_TYPE.STARGATE]: {
    name: 'Stargate',
    image: `${imageBasePath}stargate.svg`,
    color: 'grey'
  },
  [BRIDGE_TYPE.SYNAPSE]: {
    name: 'Synapse',
    image: `${imageBasePath}synapse.svg`,
    color: '#b90aba'
  },
  [BRIDGE_TYPE.WORMHOLE]: {
    name: 'Wormhole',
    image: `${imageBasePath}wormhole.svg`,
    color: 'white'
  },
  openocean: {
    name: '',
    image: '',
    color: ''
  },
  symbiosis: {
    name: '',
    image: '',
    color: ''
  },
  anyswap: {
    name: '',
    image: '',
    color: ''
  },
  debridge: {
    name: '',
    image: '',
    color: ''
  },
  osmosis: {
    name: '',
    image: '',
    color: ''
  },
  refuel: {
    name: '',
    image: '',
    color: ''
  },
  satellite: {
    name: '',
    image: '',
    color: ''
  },
  thorchain: {
    name: '',
    image: '',
    color: ''
  },
  ypool: {
    name: '',
    image: '',
    color: ''
  }
};

const CROSS_CHAIN_ROUTING_PROVIDER: Provider = {
  name: 'Cross-Chain',
  image: `${imageBasePath}ccr.svg`
};

const GAS_REFUND_PROVIDER: Provider = {
  name: 'Gas Refund',
  image: `${imageBasePath}gas-refund.svg`
};

export const TRADES_PROVIDERS: Record<TableProvider, Provider> = {
  ...BRIDGE_PROVIDERS,
  ...INSTANT_TRADES_PROVIDER,
  ...BRIDGE_TYPE_PROVIDERS,
  ...CROSS_CHAIN_TRADE_PROVIDER,
  CROSS_CHAIN_ROUTING_PROVIDER,
  GAS_REFUND_PROVIDER
};
