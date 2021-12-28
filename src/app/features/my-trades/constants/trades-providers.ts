import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { TableProvider, DEPRECATED_PROVIDER } from '@shared/models/my-trades/table-trade';

type Provider = {
  name: string;
  image: string;
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
  },
  [BRIDGE_PROVIDER.XDAI]: {
    name: 'XDai',
    image: `${imageBasePath}xdai.svg`
  }
};

const INSTANT_TRADES_PROVIDERS: Record<INSTANT_TRADE_PROVIDER, Provider> = {
  [INSTANT_TRADE_PROVIDER.UNISWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.png`
  },
  [INSTANT_TRADE_PROVIDER.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`
  },
  [INSTANT_TRADE_PROVIDER.ONEINCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`
  },
  [INSTANT_TRADE_PROVIDER.PANCAKESWAP]: {
    name: 'Pancakeswap',
    image: `${imageBasePath}pancakeswap.svg`
  },
  [INSTANT_TRADE_PROVIDER.QUICKSWAP]: {
    name: 'Quickswap',
    image: `${imageBasePath}quickswap.svg`
  },
  [INSTANT_TRADE_PROVIDER.SUSHISWAP]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`
  },
  [INSTANT_TRADE_PROVIDER.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [INSTANT_TRADE_PROVIDER.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [INSTANT_TRADE_PROVIDER.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`
  },
  [INSTANT_TRADE_PROVIDER.SPOOKYSWAP]: {
    name: 'Spookyswap',
    image: `${imageBasePath}spookyswap.png`
  },
  [INSTANT_TRADE_PROVIDER.SPIRITSWAP]: {
    name: 'Spiritswap',
    image: `${imageBasePath}spiritswap.png`
  },
  [INSTANT_TRADE_PROVIDER.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`
  },
  [INSTANT_TRADE_PROVIDER.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.png`
  },
  [INSTANT_TRADE_PROVIDER.SOLARBEAM]: {
    name: 'Solarbeam',
    image: `${imageBasePath}solarbeam.png`
  },
  [INSTANT_TRADE_PROVIDER.RAYDIUM]: {
    name: 'Raydium',
    image: `${imageBasePath}raydium.svg`
  },
  [INSTANT_TRADE_PROVIDER.ALGEBRA]: {
    name: 'Algebra',
    image: `${imageBasePath}algebra.webp`
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

const DEPRECATED_PROVIDERS: Record<DEPRECATED_PROVIDER, Provider> = {
  [DEPRECATED_PROVIDER.PANAMA]: {
    name: 'Panama',
    image: `${imageBasePath}panama.svg`
  },
  [DEPRECATED_PROVIDER.EVO]: {
    name: 'Evo',
    image: `${imageBasePath}evo.svg`
  }
};

export const TradesProviders: Record<TableProvider, Provider> = {
  ...BRIDGE_PROVIDERS,
  ...INSTANT_TRADES_PROVIDERS,
  ...DEPRECATED_PROVIDERS,
  CROSS_CHAIN_ROUTING_PROVIDER,
  GAS_REFUND_PROVIDER
};
