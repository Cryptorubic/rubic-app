import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

export const INSTANT_TRADE_PROVIDERS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADES_PROVIDER.ONEINCH
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    },
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Uniswap',
        value: INSTANT_TRADES_PROVIDER.UNISWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    },
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    }
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADES_PROVIDER.ONEINCH
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    },
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Pancakeswap',
        value: INSTANT_TRADES_PROVIDER.PANCAKESWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    },
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    }
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: '1inch',
        value: INSTANT_TRADES_PROVIDER.ONEINCH
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    },
    {
      trade: null,
      tradeState: null,
      tradeProviderInfo: {
        label: 'Quickswap',
        value: INSTANT_TRADES_PROVIDER.QUICKSWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    },
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    }
  ],
  [BLOCKCHAIN_NAME.HARMONY]: [
    {
      trade: null,
      tradeState: INSTANT_TRADES_STATUS.CALCULATION,
      tradeProviderInfo: {
        label: 'Sushiswap',
        value: INSTANT_TRADES_PROVIDER.SUSHISWAP
      },
      isBestRate: false,
      isSelected: false,
      isCollapsed: false,
      needApprove: null
    }
  ]
};
