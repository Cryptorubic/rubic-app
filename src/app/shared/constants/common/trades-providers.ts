import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { TableProvider } from '@shared/models/my-trades/table-trade';
import { TRADE_TYPE, TradeType } from 'rubic-sdk';

type Provider = {
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
  [TRADE_TYPE.UNI_SWAP_V3_ARBITRUM]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.svg`,
    color: '#FD017A'
  },
  [TRADE_TYPE.UNI_SWAP_V3_POLYGON]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.svg`,
    color: '#FD017A'
  },
  [TRADE_TYPE.UNI_SWAP_V3_ETHEREUM]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.svg`,
    color: '#FD017A'
  },
  [TRADE_TYPE.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`,
    color: '#F9DBEA'
  },
  [TRADE_TYPE.ONE_INCH_ARBITRUM]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [TRADE_TYPE.ONE_INCH_FANTOM]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [TRADE_TYPE.ONE_INCH_AVALANCHE]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [TRADE_TYPE.ONE_INCH_POLYGON]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [TRADE_TYPE.ONE_INCH_BSC]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [TRADE_TYPE.ONE_INCH_ETHEREUM]: {
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
  [TRADE_TYPE.SUSHI_SWAP_TELOS]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_ARBITRUM]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_FANTOM]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_MOONRIVER]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_AVALANCHE]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_HARMONY]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_POLYGON]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_BSC]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [TRADE_TYPE.SUSHI_SWAP_ETHEREUM]: {
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
  [TRADE_TYPE.ZRX_ETHEREUM]: {
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

const SYMBIOSIS_PROVIDER: Provider = {
  name: 'Symbiosis',
  image: `${imageBasePath}symbiosis.png`
};

export const TRADES_PROVIDERS: Record<TableProvider, Provider> = {
  ...BRIDGE_PROVIDERS,
  ...INSTANT_TRADES_PROVIDER,
  CROSS_CHAIN_ROUTING_PROVIDER,
  GAS_REFUND_PROVIDER,
  SYMBIOSIS_PROVIDER
};
