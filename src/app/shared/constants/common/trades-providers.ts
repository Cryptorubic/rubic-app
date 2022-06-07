import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { TableProvider } from '@shared/models/my-trades/table-trade';

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

const INSTANT_TRADES_PROVIDER: Record<INSTANT_TRADE_PROVIDER, Provider> = {
  [INSTANT_TRADE_PROVIDER.UNISWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.svg`,
    color: '#FD017A'
  },
  [INSTANT_TRADE_PROVIDER.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`,
    color: '#F9DBEA'
  },
  [INSTANT_TRADE_PROVIDER.ONEINCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [INSTANT_TRADE_PROVIDER.PANCAKESWAP]: {
    name: 'Pancakeswap',
    image: `${imageBasePath}pancakeswap.svg`,
    color: '#00ADE8'
  },
  [INSTANT_TRADE_PROVIDER.QUICKSWAP]: {
    name: 'Quickswap',
    image: `${imageBasePath}quickswap.svg`,
    color: '#5389C5'
  },
  [INSTANT_TRADE_PROVIDER.SUSHISWAP]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [INSTANT_TRADE_PROVIDER.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`,
    color: '#FC5408;'
  },
  [INSTANT_TRADE_PROVIDER.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`,
    color: '#6665DD'
  },
  [INSTANT_TRADE_PROVIDER.SPOOKYSWAP]: {
    name: 'Spookyswap',
    image: `${imageBasePath}spookyswap.png`,
    color: '#59C3C8'
  },
  [INSTANT_TRADE_PROVIDER.SPIRITSWAP]: {
    name: 'Spiritswap',
    image: `${imageBasePath}spiritswap.png`,
    color: '#59C3C8'
  },
  [INSTANT_TRADE_PROVIDER.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`,
    color: '#FFFFFF'
  },
  [INSTANT_TRADE_PROVIDER.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.png`,
    color: '#FFFFFF'
  },
  [INSTANT_TRADE_PROVIDER.SOLARBEAM]: {
    name: 'Solarbeam',
    image: `${imageBasePath}solarbeam.png`,
    color: '#F2A272'
  },
  [INSTANT_TRADE_PROVIDER.RAYDIUM]: {
    name: 'Raydium',
    image: `${imageBasePath}raydium.svg`,
    color: '#3875FD'
  },
  [INSTANT_TRADE_PROVIDER.REF]: {
    name: 'Ref Finance',
    image: `${imageBasePath}ref-finance.svg`
  },
  [INSTANT_TRADE_PROVIDER.ALGEBRA]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.webp`,
    color: '#00CAB2'
  },
  [INSTANT_TRADE_PROVIDER.VIPER]: {
    name: 'Viper',
    image: `${imageBasePath}viperswap.svg`,
    color: '#00805C'
  },
  [INSTANT_TRADE_PROVIDER.TRISOLARIS]: {
    name: 'Trisolaris',
    image: `${imageBasePath}trisolaris.svg`,
    color: '#00F4FF'
  },
  [INSTANT_TRADE_PROVIDER.WANNASWAP]: {
    name: 'Wannaswap',
    image: `${imageBasePath}wannaswap.svg`,
    color: '#FACB5B'
  },
  [INSTANT_TRADE_PROVIDER.ZAPPY]: {
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
