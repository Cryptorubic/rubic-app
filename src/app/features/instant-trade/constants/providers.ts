import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADES_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { InstantTradeProvider } from '@shared/models/instant-trade/instant-trade-provider';
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
        value: InstantTradeProvider.UNISWAP_V3
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: InstantTradeProvider.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Uniswap V2',
        value: InstantTradeProvider.UNISWAP_V2
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: InstantTradeProvider.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '0x',
        value: InstantTradeProvider.ZRX
      }
    }
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: InstantTradeProvider.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Pancakeswap',
        value: InstantTradeProvider.PANCAKESWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: InstantTradeProvider.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Algebra',
        value: InstantTradeProvider.ALGEBRA
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: InstantTradeProvider.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Quickswap',
        value: InstantTradeProvider.QUICKSWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: InstantTradeProvider.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.HARMONY]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: InstantTradeProvider.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.AVALANCHE]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: InstantTradeProvider.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Pangolin',
        value: InstantTradeProvider.PANGOLIN
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Joe',
        value: InstantTradeProvider.JOE
      }
    }
  ],
  [BLOCKCHAIN_NAME.MOONRIVER]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: InstantTradeProvider.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Solarbeam',
        value: InstantTradeProvider.SOLARBEAM
      }
    }
  ],
  [BLOCKCHAIN_NAME.FANTOM]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Spookyswap',
        value: InstantTradeProvider.SPOOKYSWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Spiritswap',
        value: InstantTradeProvider.SPIRITSWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: InstantTradeProvider.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.SOLANA]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Raydium',
        value: InstantTradeProvider.RAYDIUM
      }
    }
  ]
};
