import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADES_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { ProviderControllerData } from '@features/instant-trade/models/providers-controller-data';

const defaultState: ProviderControllerData = {
  trade: null,
  tradeState: INSTANT_TRADES_STATUS.CALCULATION,
  tradeProviderInfo: null,
  isSelected: false,
  needApprove: null
};

export const INSTANT_TRADE_PROVIDERS: Partial<Record<BLOCKCHAIN_NAME, ProviderControllerData[]>> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Uniswap V3',
        value: INSTANT_TRADE_PROVIDER.UNISWAP_V3
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADE_PROVIDER.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Uniswap V2',
        value: INSTANT_TRADE_PROVIDER.UNISWAP_V2
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADE_PROVIDER.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '0x',
        value: INSTANT_TRADE_PROVIDER.ZRX
      }
    }
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADE_PROVIDER.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Pancakeswap',
        value: INSTANT_TRADE_PROVIDER.PANCAKESWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADE_PROVIDER.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Algebra',
        value: INSTANT_TRADE_PROVIDER.ALGEBRA
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADE_PROVIDER.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Quickswap',
        value: INSTANT_TRADE_PROVIDER.QUICKSWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADE_PROVIDER.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.HARMONY]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADE_PROVIDER.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.AVALANCHE]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADE_PROVIDER.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Pangolin',
        value: INSTANT_TRADE_PROVIDER.PANGOLIN
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Joe',
        value: INSTANT_TRADE_PROVIDER.JOE
      }
    }
  ],
  [BLOCKCHAIN_NAME.MOONRIVER]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADE_PROVIDER.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Solarbeam',
        value: INSTANT_TRADE_PROVIDER.SOLARBEAM
      }
    }
  ],
  [BLOCKCHAIN_NAME.FANTOM]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Spookyswap',
        value: INSTANT_TRADE_PROVIDER.SPOOKYSWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Spiritswap',
        value: INSTANT_TRADE_PROVIDER.SPIRITSWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADE_PROVIDER.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.SOLANA]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Raydium',
        value: INSTANT_TRADE_PROVIDER.RAYDIUM
      }
    }
  ]
};
