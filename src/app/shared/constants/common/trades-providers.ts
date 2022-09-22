import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { TableProvider } from '@shared/models/my-trades/table-trade';
import {
  BRIDGE_TYPE,
  BridgeType,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  TRADE_TYPE,
  TradeType
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
  [TRADE_TYPE.ACRYPTOS]: {
    name: 'Acryptos',
    image: `${imageBasePath}acryptos.png`,
    color: '#FF0A1C'
  },
  [TRADE_TYPE.ALDRIN_EXCHANGE]: {
    name: 'AldrinExchange',
    image: `${imageBasePath}aldrin.svg`,
    color: ''
  },
  [TRADE_TYPE.ALGEBRA]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.svg`,
    color: '#00CAB2'
  },
  [TRADE_TYPE.ANNEX]: {
    name: 'Annex',
    image: `${imageBasePath}annex.webp`,
    color: '#FFAD4F'
  },
  [TRADE_TYPE.APE_SWAP]: {
    name: 'Acryptos',
    image: `${imageBasePath}ape.svg`,
    color: '#A16552'
  },
  [TRADE_TYPE.ARTH_SWAP]: {
    name: 'ArthSwap',
    image: `${imageBasePath}arth.png`,
    color: '#00C6EE'
  },

  [TRADE_TYPE.BABY_SWAP]: {
    name: 'BabySwap',
    image: `${imageBasePath}babyswap.svg`,
    color: '#E89B37'
  },
  [TRADE_TYPE.BALANCER]: {
    name: 'Balancer',
    image: `${imageBasePath}balancer.svg`,
    color: ''
  },
  [TRADE_TYPE.BEAM_SWAP]: {
    name: 'BeamSwap',
    image: `${imageBasePath}beamswap.png`,
    color: '#26B7F0'
  },
  [TRADE_TYPE.BI_SWAP]: {
    name: 'BiSwap',
    image: `${imageBasePath}biswap.svg`,
    color: ''
  },

  [TRADE_TYPE.CREMA_FINANCE]: {
    name: 'CremaFinance',
    image: `${imageBasePath}cremafinance.ico`,
    color: '#6AE2DC'
  },
  [TRADE_TYPE.CRONA_SWAP]: {
    name: 'CronaSwap',
    image: `${imageBasePath}cronaswap.webp`,
    color: '#020426'
  },
  [TRADE_TYPE.CROPPER_FINANCE]: {
    name: 'CropperFinance',
    image: `${imageBasePath}cropperfinance.ico`,
    color: '#9B5FE3'
  },
  [TRADE_TYPE.CROW_FI]: {
    name: 'CrowFi',
    image: `${imageBasePath}crowfi.png`,
    color: ''
  },
  [TRADE_TYPE.CRO_DEX]: {
    name: 'CroDex',
    image: `${imageBasePath}crodex.png`,
    color: '#F05A28'
  },
  [TRADE_TYPE.CURVE]: {
    name: 'Curve',
    image: `${imageBasePath}curve.svg`,
    color: ''
  },

  [TRADE_TYPE.DEFI_PLAZA]: {
    name: 'DefiPlaza',
    image: `${imageBasePath}defiplaza.png`,
    color: '#5D10C0'
  },
  [TRADE_TYPE.DEFI_SWAP]: {
    name: 'DefiSwap',
    image: `${imageBasePath}defiswap.webp`,
    color: '#012C70'
  },
  [TRADE_TYPE.DFYN]: {
    name: 'Dfyn',
    image: `${imageBasePath}dfyn.svg`,
    color: '#828CBE'
  },
  [TRADE_TYPE.DODO]: {
    name: 'Dodo',
    image: `${imageBasePath}dodo.png`,
    color: '#efc20b'
  },
  [TRADE_TYPE.DYSTOPIA]: {
    name: 'Dystopia',
    image: `${imageBasePath}dystopia.png`,
    color: '#085F8E'
  },

  [TRADE_TYPE.HONEY_SWAP]: {
    name: 'HoneySwap',
    image: `${imageBasePath}honeyswap.webp`,
    color: '#efc20b'
  },

  [TRADE_TYPE.JET_SWAP]: {
    name: 'JetSwap',
    image: `${imageBasePath}jetswap.png`,
    color: '#F7C415'
  },
  [TRADE_TYPE.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`,
    color: '#6665DD'
  },
  [TRADE_TYPE.J_SWAP]: {
    name: 'JSwap',
    image: `${imageBasePath}jswap.jpg`,
    color: '#5b55e3'
  },

  [TRADE_TYPE.KYBER_SWAP]: {
    name: 'KyberSwap',
    image: `${imageBasePath}kyberswap.svg`,
    color: '#31CB9E'
  },

  [TRADE_TYPE.LUA_SWAP]: {
    name: 'LuaSwap',
    image: `${imageBasePath}luaswap.png`,
    color: '#FABD45'
  },

  [TRADE_TYPE.MAVERICK]: {
    name: 'Maverick',
    image: `${imageBasePath}maverick.png`,
    color: '#6401FF'
  },
  [TRADE_TYPE.MDEX]: {
    name: 'MDEX',
    image: `${imageBasePath}mdex.svg`,
    color: '#50B0E4'
  },
  [TRADE_TYPE.MESH_SWAP]: {
    name: 'MeshSwap',
    image: `${imageBasePath}meshswap.svg`,
    color: '#BF96FF'
  },
  [TRADE_TYPE.MM_FINANCE]: {
    name: 'MMFinance',
    image: `${imageBasePath}mmfinance.png`,
    color: '#F0BC82'
  },
  [TRADE_TYPE.MOJITO_SWAP]: {
    name: 'MojitoSwap',
    image: `${imageBasePath}mojitoswap.svg`,
    color: '#0AC4DD'
  },

  [TRADE_TYPE.ONE_INCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [TRADE_TYPE.ONE_MOON]: {
    name: 'OneMoon',
    image: `${imageBasePath}onemoon.ico`,
    color: '#0B86FF'
  },
  [TRADE_TYPE.ONE_SOL]: {
    name: '1sol',
    image: `${imageBasePath}onesol.png`,
    color: ''
  },
  [TRADE_TYPE.OOLONG_SWAP]: {
    name: 'OolongSwap',
    image: `${imageBasePath}oolongswap.png`,
    color: '#F5A14A'
  },
  [TRADE_TYPE.OPEN_OCEAN]: {
    name: 'Open Ocean',
    image: `${imageBasePath}open-ocean.png`,
    color: ''
  },
  [TRADE_TYPE.ORCA_SWAP]: {
    name: 'OrcaSwap',
    image: `${imageBasePath}orcaswap.svg`,
    color: '#F2C45B'
  },
  [TRADE_TYPE.OSMOSIS_SWAP]: {
    name: 'OsmosisSwap',
    image: `${imageBasePath}osmosis.svg`,
    color: '#5E12A0'
  },

  [TRADE_TYPE.PANCAKE_SWAP]: {
    name: 'PancakeSwap',
    image: `${imageBasePath}pancakeswap.svg`,
    color: '#00ADE8'
  },
  [TRADE_TYPE.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`,
    color: '#FC5408'
  },
  [TRADE_TYPE.PARA_SWAP]: {
    name: 'ParaSwap',
    image: `${imageBasePath}paraswap.svg`,
    color: '#2e58b0'
  },
  [TRADE_TYPE.POLYDEX]: {
    name: 'Polydex',
    image: `${imageBasePath}polydex.svg`,
    color: '#0D2866'
  },

  [TRADE_TYPE.QUICK_SWAP]: {
    name: 'QuickSwap',
    image: `${imageBasePath}quickswap.svg`,
    color: '#36C2EA'
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

  [TRADE_TYPE.SABER_STABLE_SWAP]: {
    name: 'SaberStableSwap',
    image: `${imageBasePath}`,
    color: '#5156C0'
  },
  [TRADE_TYPE.SAROS_SWAP]: {
    name: 'SarosSwap',
    image: `${imageBasePath}sarosswap.png`,
    color: '#6CBCCE'
  },
  [TRADE_TYPE.SERUM]: {
    name: 'Serum',
    image: `${imageBasePath}serum.png`,
    color: '#38B9CC'
  },
  [TRADE_TYPE.SHIBA_SWAP]: {
    name: 'ShibaSwap',
    image: `${imageBasePath}shibaswap.svg`,
    color: '#6CBCCE'
  },
  [TRADE_TYPE.SMOOTHY]: {
    name: 'Smoothy',
    image: `${imageBasePath}smoothy.png`,
    color: '#BC2723'
  },
  [TRADE_TYPE.SOLAR_BEAM]: {
    name: 'SolarBeam',
    image: `${imageBasePath}solarbeam.svg`,
    color: '#F2A272'
  },
  [TRADE_TYPE.SPIRIT_SWAP]: {
    name: 'SpiritSwap',
    image: `${imageBasePath}spiritswap.png`,
    color: '#59C3C8'
  },
  [TRADE_TYPE.SPL_TOKEN_SWAP]: {
    name: 'SplTokenSwap',
    image: `${imageBasePath}`,
    color: '#15F095'
  },
  [TRADE_TYPE.SPOOKY_SWAP]: {
    name: 'SpookySwap',
    image: `${imageBasePath}spookyswap.svg`,
    color: '#59C3C8'
  },
  [TRADE_TYPE.STELLA_SWAP]: {
    name: 'StellaSwap',
    image: `${imageBasePath}stellaswap.svg`,
    color: '#E2107B'
  },
  [TRADE_TYPE.SUSHI_SWAP]: {
    name: 'SushiSwap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },

  [TRADE_TYPE.TRISOLARIS]: {
    name: 'Trisolaris',
    image: `${imageBasePath}trisolaris.svg`,
    color: '#00F4FF'
  },

  [TRADE_TYPE.UBE_SWAP]: {
    name: 'UbeSwap',
    image: `${imageBasePath}ubeswap.svg`,
    color: '#6D619A'
  },
  [TRADE_TYPE.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`,
    color: '#F9DBEA'
  },
  [TRADE_TYPE.UNI_SWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.svg`,
    color: '#FD017A'
  },

  [TRADE_TYPE.VIPER_SWAP]: {
    name: 'Viper',
    image: `${imageBasePath}viperswap.svg`,
    color: '#00805C'
  },
  [TRADE_TYPE.VOLTAGE_SWAP]: {
    name: 'VoltageSwap',
    image: `${imageBasePath}voltageswap.png`,
    color: '#23A863'
  },
  [TRADE_TYPE.VVS_FINANCE]: {
    name: 'VVSFinance',
    image: `${imageBasePath}vvsfinance.png`,
    color: '#2B3852'
  },

  [TRADE_TYPE.WANNA_SWAP]: {
    name: 'Wannaswap',
    image: `${imageBasePath}wannaswap.svg`,
    color: '#FACB5B'
  },
  [TRADE_TYPE.WAULT_SWAP]: {
    name: 'WaultSwap',
    image: `${imageBasePath}waultswap.png`,
    color: '#1E7C77'
  },
  [TRADE_TYPE.WOO_FI]: {
    name: 'WooFi',
    image: `${imageBasePath}woofi.png`,
    color: '#72BEF4'
  },
  [TRADE_TYPE.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`,
    color: ''
  },

  [TRADE_TYPE.ZAPPY]: {
    name: 'Zappy',
    image: `${imageBasePath}zappy.svg`,
    color: '#00e7e7'
  },
  [TRADE_TYPE.ZIP_SWAP]: {
    name: 'ZipSwap',
    image: `${imageBasePath}zipswap.svg`,
    color: '#34A5F5'
  },
  [TRADE_TYPE.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.svg`,
    color: '#34A5F5'
  },
  [TRADE_TYPE.AURORA_SWAP]: {
    name: 'AuroraSwap',
    image: '${imageBasePath}auroraswap.svg',
    color: '#34A5F5'
  },
  [TRADE_TYPE.JUPITER]: {
    name: 'Jupiter',
    image: '${imageBasePath}jupiter.svg',
    color: '#34A5F5'
  },
  [TRADE_TYPE.REN_BTC]: {
    name: 'renBTC',
    image: `${imageBasePath}renbtc.svg`,
    color: 'grey'
  }
};

const CROSS_CHAIN_TRADE_PROVIDER: Record<CrossChainTradeType, Provider> = {
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
  [CROSS_CHAIN_TRADE_TYPE.VIA]: {
    name: 'Via',
    image: ``
  },
  [CROSS_CHAIN_TRADE_TYPE.RANGO]: {
    name: 'Rango',
    image: ``
  },
  [CROSS_CHAIN_TRADE_TYPE.BRIDGERS]: {
    name: 'Bridgers',
    image: `${imageBasePath}bridgers.png`,
    color: '#E6F3FF'
  }
};

export const CROSS_CHAIN_BRIDGE_PROVIDER: Record<BridgeType, Provider> = {
  [BRIDGE_TYPE.ACROSS]: {
    name: 'Across',
    image: `${imageBasePath}across.svg`,
    color: '#29a98b'
  },
  [BRIDGE_TYPE.ANY_SWAP]: {
    name: 'AnySwap',
    image: `${imageBasePath}anyswap.svg`,
    color: '#5F6BFB'
  },
  [BRIDGE_TYPE.ARBITRUM_BRIDGE]: {
    name: 'Arbitrum Bridge',
    image: `${imageBasePath}arbitrum-bridge.svg`,
    color: '#1275b7'
  },
  [BRIDGE_TYPE.AVALANCHE_BRIDGE]: {
    name: 'Avalanche Bridge',
    image: `${imageBasePath}avalanche-bridge.svg`,
    color: ''
  },

  [BRIDGE_TYPE.CELER_BRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}celer.svg`,
    color: ''
  },
  [BRIDGE_TYPE.CONNEXT]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#8e28fe'
  },

  [BRIDGE_TYPE.DE_BRIDGE]: {
    name: 'DeBridge',
    image: `${imageBasePath}debridge.svg`,
    color: '#bf38ee'
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
    color: ''
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
    color: ''
  },

  [BRIDGE_TYPE.YPOOL]: {
    name: 'YPool',
    image: `${imageBasePath}ypool.svg`,
    color: '#15D9E1'
  },
  [BRIDGE_TYPE.OPEN_OCEAN]: {
    name: 'Open Ocean',
    image: '${imageBasePath}openocean.png',
    color: '#15D9E1'
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
  ...CROSS_CHAIN_BRIDGE_PROVIDER,
  ...CROSS_CHAIN_TRADE_PROVIDER,
  CROSS_CHAIN_ROUTING_PROVIDER,
  GAS_REFUND_PROVIDER
};
