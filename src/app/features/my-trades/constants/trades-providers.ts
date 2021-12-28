import { BridgeProvider } from '@shared/models/bridge/bridge-provider';
import { InstantTradeProvider } from '@shared/models/instant-trade/instant-trade-provider';
import { TableProvider, DEPRECATED_PROVIDER } from '@shared/models/my-trades/table-trade';

type Provider = {
  name: string;
  image: string;
};

const imageBasePath = 'assets/images/icons/providers/';

const BRIDGE_PROVIDERS: Record<BridgeProvider, Provider> = {
  [BridgeProvider.SWAP_RBC]: {
    name: 'Rubic',
    image: `${imageBasePath}rubic.svg`
  },
  [BridgeProvider.POLYGON]: {
    name: 'Polygon',
    image: `${imageBasePath}polygon.svg`
  },
  [BridgeProvider.XDAI]: {
    name: 'XDai',
    image: `${imageBasePath}xdai.svg`
  }
};

const INSTANT_TRADES_PROVIDERS: Record<InstantTradeProvider, Provider> = {
  [InstantTradeProvider.UNISWAP_V3]: {
    name: 'Uniswap V3',
    image: `${imageBasePath}uniswap-3.png`
  },
  [InstantTradeProvider.UNISWAP_V2]: {
    name: 'Uniswap V2',
    image: `${imageBasePath}uniswap-2.svg`
  },
  [InstantTradeProvider.ONEINCH]: {
    name: '1inch',
    image: `${imageBasePath}oneinch.svg`
  },
  [InstantTradeProvider.PANCAKESWAP]: {
    name: 'Pancakeswap',
    image: `${imageBasePath}pancakeswap.svg`
  },
  [InstantTradeProvider.QUICKSWAP]: {
    name: 'Quickswap',
    image: `${imageBasePath}quickswap.svg`
  },
  [InstantTradeProvider.SUSHISWAP]: {
    name: 'Sushiswap',
    image: `${imageBasePath}sushiswap.svg`
  },
  [InstantTradeProvider.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [InstantTradeProvider.PANGOLIN]: {
    name: 'Pangolin',
    image: `${imageBasePath}pangolin.svg`
  },
  [InstantTradeProvider.JOE]: {
    name: 'Joe',
    image: `${imageBasePath}joe.png`
  },
  [InstantTradeProvider.SPOOKYSWAP]: {
    name: 'Spookyswap',
    image: `${imageBasePath}spookyswap.png`
  },
  [InstantTradeProvider.SPIRITSWAP]: {
    name: 'Spiritswap',
    image: `${imageBasePath}spiritswap.png`
  },
  [InstantTradeProvider.WRAPPED]: {
    name: 'Wrapped',
    image: `${imageBasePath}wrapped.png`
  },
  [InstantTradeProvider.ZRX]: {
    name: '0x',
    image: `${imageBasePath}zrx.png`
  },
  [InstantTradeProvider.SOLARBEAM]: {
    name: 'Solarbeam',
    image: `${imageBasePath}solarbeam.png`
  },
  [InstantTradeProvider.RAYDIUM]: {
    name: 'Raydium',
    image: `${imageBasePath}raydium.svg`
  },
  [InstantTradeProvider.ALGEBRA]: {
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
