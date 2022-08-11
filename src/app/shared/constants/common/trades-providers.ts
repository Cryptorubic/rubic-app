import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { TableProvider } from '@shared/models/my-trades/table-trade';
import {
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  TRADE_TYPE,
  TradeType,
  Li_FI_TRADE_SUBTYPE,
  LiFiTradeSubtype
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
    image: `${imageBasePath}ubeswap.svg`,
    color: '##5b55e3'
  },
  [TRADE_TYPE.CRONA_SWAP]: {
    name: 'Cronaswap',
    image: ``,
    color: ''
  },
  [TRADE_TYPE.OOLONG_SWAP]: {
    name: 'Oolongswap',
    image: `${imageBasePath}ubeswap.svg`,
    color: '##5b55e3'
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
  }
};

export const LIFI_BRIDGE_PROVIDER: Record<LiFiTradeSubtype, Provider> = {
  [Li_FI_TRADE_SUBTYPE.ACROSS]: {
    name: 'Across',
    image: `${imageBasePath}across.svg`,
    color: '#29a98b'
  },
  [Li_FI_TRADE_SUBTYPE.ARBITRUM_BRIDGE]: {
    name: 'Arbitrum Bridge',
    image: `${imageBasePath}arbitrum-bridge.svg`,
    color: '#1275b7'
  },
  [Li_FI_TRADE_SUBTYPE.AVALANCHE_BRIDGE]: {
    name: 'Avalanche Bridge',
    image: `${imageBasePath}avalanche-bridge.svg`,
    color: '#323232'
  },
  [Li_FI_TRADE_SUBTYPE.CELER_BRIDGE]: {
    name: 'cBridge',
    image: `${imageBasePath}celer.svg`,
    color: 'white'
  },
  [Li_FI_TRADE_SUBTYPE.CONNECT]: {
    name: 'Connext',
    image: `${imageBasePath}connext.svg`,
    color: '#8e28fe'
  },
  [Li_FI_TRADE_SUBTYPE.HOP]: {
    name: 'Hop',
    image: `${imageBasePath}hop.svg`,
    color: '#de7fb8'
  },
  [Li_FI_TRADE_SUBTYPE.HYPHEN]: {
    name: 'Hyphen',
    image: `${imageBasePath}hyphen.svg`,
    color: '#353392'
  },
  [Li_FI_TRADE_SUBTYPE.MAKERS_WORMHOLE]: {
    name: `Maker's wormhole`,
    image: `${imageBasePath}wormhole.svg`,
    color: 'white'
  },
  [Li_FI_TRADE_SUBTYPE.MULTICHAIN]: {
    name: 'Multichain',
    image: `${imageBasePath}multichain.png`,
    color: '#452fbf'
  },
  [Li_FI_TRADE_SUBTYPE.OPTIMISM_GATEWAY]: {
    name: 'Optimism Gateway',
    image: `${imageBasePath}optimism-gateway.svg`,
    color: 'white'
  },
  [Li_FI_TRADE_SUBTYPE.POLYGON]: {
    name: 'Polygon bridge',
    image: `${imageBasePath}polygon-bridge.png`,
    color: '#5d25ba'
  },
  [Li_FI_TRADE_SUBTYPE.STARGATE]: {
    name: 'Stargate',
    image: `${imageBasePath}stargate.svg`,
    color: 'grey'
  },
  [Li_FI_TRADE_SUBTYPE.SYNAPSE]: {
    name: 'Synapse',
    image: `${imageBasePath}synapse.svg`,
    color: '#b90aba'
  },
  [Li_FI_TRADE_SUBTYPE.WORMHOLE]: {
    name: 'Wormhole',
    image: `${imageBasePath}wormhole.svg`,
    color: 'white'
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
  ...LIFI_BRIDGE_PROVIDER,
  ...CROSS_CHAIN_TRADE_PROVIDER,
  CROSS_CHAIN_ROUTING_PROVIDER,
  GAS_REFUND_PROVIDER
};
