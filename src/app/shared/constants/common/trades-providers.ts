import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
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
  }
};

const INSTANT_TRADES_PROVIDER: Record<INSTANT_TRADES_PROVIDERS, Provider> = {
  [INSTANT_TRADES_PROVIDERS.UNISWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.png`,
    color: '#FD017A'
  },
  [INSTANT_TRADES_PROVIDERS.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`,
    color: '#F9DBEA'
  },
  [INSTANT_TRADES_PROVIDERS.ONEINCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`,
    color: '#94A6C3'
  },
  [INSTANT_TRADES_PROVIDERS.PANCAKESWAP]: {
    name: 'Pancakeswap',
    image: `${imageBasePath}pancakeswap.svg`,
    color: '#00ADE8'
  },
  [INSTANT_TRADES_PROVIDERS.QUICKSWAP]: {
    name: 'Quickswap',
    image: `${imageBasePath}quickswap.svg`,
    color: '#5389C5'
  },
  [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`,
    color: '#E05DAA'
  },
  [INSTANT_TRADES_PROVIDERS.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`,
    color: '#FC5408;'
  },
  [INSTANT_TRADES_PROVIDERS.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`,
    color: '#6665DD'
  },
  [INSTANT_TRADES_PROVIDERS.SPOOKYSWAP]: {
    name: 'Spookyswap',
    image: `${imageBasePath}spookyswap.png`,
    color: '#59C3C8'
  },
  [INSTANT_TRADES_PROVIDERS.SPIRITSWAP]: {
    name: 'Spiritswap',
    image: `${imageBasePath}spiritswap.png`,
    color: '#59C3C8'
  },
  [INSTANT_TRADES_PROVIDERS.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`,
    color: '#FFFFFF'
  },
  [INSTANT_TRADES_PROVIDERS.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.png`,
    color: '#FFFFFF'
  },
  [INSTANT_TRADES_PROVIDERS.SOLARBEAM]: {
    name: 'Solarbeam',
    image: `${imageBasePath}solarbeam.png`,
    color: '#F2A272'
  },
  [INSTANT_TRADES_PROVIDERS.RAYDIUM]: {
    name: 'Raydium',
    image: `${imageBasePath}raydium.svg`,
    color: '#3875FD'
  },
  [INSTANT_TRADES_PROVIDERS.REF]: {
    name: 'Ref Finance',
    image: `${imageBasePath}ref-finance.svg`
  },
  [INSTANT_TRADES_PROVIDERS.ALGEBRA]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.webp`,
    color: '#00CAB2'
  },
  [INSTANT_TRADES_PROVIDERS.VIPER]: {
    name: 'Viper',
    image: `${imageBasePath}viperswap.svg`,
    color: '#00805C'
  },
  [INSTANT_TRADES_PROVIDERS.TRISOLARIS]: {
    name: 'Trisolaris',
    image: `${imageBasePath}trisolaris.svg`,
    color: '#00F4FF'
  },
  [INSTANT_TRADES_PROVIDERS.WANNASWAP]: {
    name: 'Wannaswap',
    image: `${imageBasePath}wannaswap.png`,
    color: '#FACB5B'
  },
  [INSTANT_TRADES_PROVIDERS.ZAPPY]: {
    name: 'Zappy',
    image: `${imageBasePath}zappy.svg`,
    color: '#00e7e7'
  },
  [INSTANT_TRADES_PROVIDERS.OMNIDEX]: {
    name: 'Omnidex',
    image: `${imageBasePath}omnidex.svg`,
    color: '#e9981b'
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
  CROSS_CHAIN_ROUTING_PROVIDER,
  GAS_REFUND_PROVIDER
};
