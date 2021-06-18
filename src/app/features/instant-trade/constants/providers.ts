import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-trade-status';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';

export const INSTANT_TRADE_PROVIDERS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: '1inch',
        value: PROVIDERS.ONEINCH
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false
    },
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Uniswap',
        value: PROVIDERS.UNISWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false
    }
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: '1inch',
        value: PROVIDERS.ONEINCH
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false
    },
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Pancakeswap',
        value: PROVIDERS.PANCAKESWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false
    }
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: '1inch',
        value: PROVIDERS.ONEINCH
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false
    },
    {
      trade: null,
      tradeState: null,
      tradeProviderInfo: {
        label: 'Quickswap',
        value: PROVIDERS.QUICKSWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false
    }
  ]
};
