import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { DEPRECATED_PROVIDER, TableProvider } from '@shared/models/my-trades/table-trade';

type Provider = {
  name: string;
  image: string;
};

const imageBasePath = 'assets/images/icons/providers/';

const bridgesProviders: Record<BRIDGE_PROVIDER, Provider> = {
  [BRIDGE_PROVIDER.SWAP_RBC]: {
    name: 'Rubic',
    image: `${imageBasePath}rubic.svg`
  },
  [BRIDGE_PROVIDER.POLYGON]: {
    name: 'Polygon',
    image: `${imageBasePath}polygon.svg`
  },
  [BRIDGE_PROVIDER.XDAI]: {
    name: 'XDai',
    image: `${imageBasePath}xdai.svg`
  }
};

const instantTradesProviders: Record<INSTANT_TRADES_PROVIDERS, Provider> = {
  [INSTANT_TRADES_PROVIDERS.UNISWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.png`
  },
  [INSTANT_TRADES_PROVIDERS.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`
  },
  [INSTANT_TRADES_PROVIDERS.ONEINCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`
  },
  [INSTANT_TRADES_PROVIDERS.PANCAKESWAP]: {
    name: 'Pancakeswap',
    image: `${imageBasePath}pancakeswap.svg`
  },
  [INSTANT_TRADES_PROVIDERS.QUICKSWAP]: {
    name: 'Quickswap',
    image: `${imageBasePath}quickswap.svg`
  },
  [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`
  },
  [INSTANT_TRADES_PROVIDERS.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [INSTANT_TRADES_PROVIDERS.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [INSTANT_TRADES_PROVIDERS.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`
  },
  [INSTANT_TRADES_PROVIDERS.SPOOKYSWAP]: {
    name: 'Spookyswap',
    image: `${imageBasePath}spookyswap.png`
  },
  [INSTANT_TRADES_PROVIDERS.SPIRITSWAP]: {
    name: 'Spiritswap',
    image: `${imageBasePath}spiritswap.png`
  },
  [INSTANT_TRADES_PROVIDERS.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`
  },
  [INSTANT_TRADES_PROVIDERS.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.png`
  },
  [INSTANT_TRADES_PROVIDERS.SOLARBEAM]: {
    name: 'Solarbeam',
    image: `${imageBasePath}solarbeam.png`
  },
  [INSTANT_TRADES_PROVIDERS.RAYDIUM]: {
    name: 'Raydium',
    image: `${imageBasePath}raydium.svg`
  },
  [INSTANT_TRADES_PROVIDERS.ALGEBRA]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.webp`
  },
  [INSTANT_TRADES_PROVIDERS.VIPER]: {
    name: 'Viper',
    image: `${imageBasePath}viperswap.svg`
  }
};

const crossChainProvider: Provider = {
  name: 'Cross-Chain',
  image: `${imageBasePath}ccr.svg`
};

const gasRefundProvider: Provider = {
  name: 'Gas Refund',
  image: `${imageBasePath}gas-refund.svg`
};

const deprecatedProviders: Record<DEPRECATED_PROVIDER, Provider> = {
  [DEPRECATED_PROVIDER.PANAMA]: {
    name: 'Panama',
    image: `${imageBasePath}panama.svg`
  },
  [DEPRECATED_PROVIDER.EVO]: {
    name: 'Evo',
    image: `${imageBasePath}evo.svg`
  }
};

export const tradesProviders: Record<TableProvider, Provider> = {
  ...bridgesProviders,
  ...instantTradesProviders,
  ...deprecatedProviders,
  CROSS_CHAIN_ROUTING_PROVIDER: crossChainProvider,
  GAS_REFUND_PROVIDER: gasRefundProvider
};
