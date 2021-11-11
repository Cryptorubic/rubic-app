import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
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
        value: INSTANT_TRADES_PROVIDER.UNISWAP_V3
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADES_PROVIDER.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Uniswap V2',
        value: INSTANT_TRADES_PROVIDER.UNISWAP_V2
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '0x',
        value: INSTANT_TRADES_PROVIDER.ZRX
      }
    }
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADES_PROVIDER.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Pancakeswap',
        value: INSTANT_TRADES_PROVIDER.PANCAKESWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADES_PROVIDER.ONEINCH
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Quickswap',
        value: INSTANT_TRADES_PROVIDER.QUICKSWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.HARMONY]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      }
    }
  ],
  [BLOCKCHAIN_NAME.AVALANCHE]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Pangolin',
        value: INSTANT_TRADES_PROVIDER.PANGOLIN
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Joe',
        value: INSTANT_TRADES_PROVIDER.JOE
      }
    }
  ],
  [BLOCKCHAIN_NAME.MOONRIVER]: [
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      }
    },
    {
      ...defaultState,
      tradeProviderInfo: {
        label: 'Solarbeam',
        value: INSTANT_TRADES_PROVIDER.SOLARBEAM
      }
    }
  ]
};
