import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import { TableProvider, DEPRECATED_PROVIDER } from '@shared/models/my-trades/TableTrade';

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

const INSTANT_TRADES_PROVIDERS: Record<INSTANT_TRADES_PROVIDER, Provider> = {
  [INSTANT_TRADES_PROVIDER.UNISWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.png`
  },
  [INSTANT_TRADES_PROVIDER.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`
  },
  [INSTANT_TRADES_PROVIDER.ONEINCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`
  },
  [INSTANT_TRADES_PROVIDER.PANCAKESWAP]: {
    name: 'Pancakeswap',
    image: `${imageBasePath}pancakeswap.svg`
  },
  [INSTANT_TRADES_PROVIDER.QUICKSWAP]: {
    name: 'Quickswap',
    image: `${imageBasePath}quickswap.svg`
  },
  [INSTANT_TRADES_PROVIDER.SUSHISWAP]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`
  },
  [INSTANT_TRADES_PROVIDER.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [INSTANT_TRADES_PROVIDER.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [INSTANT_TRADES_PROVIDER.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`
  },
  [INSTANT_TRADES_PROVIDER.SPOOKYSWAP]: {
    name: 'Spookyswap',
    image: `${imageBasePath}spookyswap.png`
  },
  [INSTANT_TRADES_PROVIDER.SPIRITSWAP]: {
    name: 'Spiritswap',
    image: `${imageBasePath}spiritswap.png`
  },
  [INSTANT_TRADES_PROVIDER.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`
  },
  [INSTANT_TRADES_PROVIDER.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.png`
  },
  [INSTANT_TRADES_PROVIDER.SOLARBEAM]: {
    name: 'Solarbeam',
    image: `${imageBasePath}solarbeam.png`
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

export const TRADES_PROVIDERS: Record<TableProvider, Provider> = {
  ...BRIDGE_PROVIDERS,
  ...INSTANT_TRADES_PROVIDERS,
  ...DEPRECATED_PROVIDERS,
  CROSS_CHAIN_ROUTING_PROVIDER,
  GAS_REFUND_PROVIDER
};
