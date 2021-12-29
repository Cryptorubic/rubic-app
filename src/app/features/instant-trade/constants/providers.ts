import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import { ProviderControllerData } from '@features/instant-trade/models/providers-controller-data';
import { instantTradesLabels } from '@shared/constants/instant-trade/instant-trades-labels';

const defaultState: ProviderControllerData = {
  trade: null,
  tradeState: INSTANT_TRADES_STATUS.CALCULATION,
  tradeProviderInfo: null,
  isSelected: false,
  needApprove: null
};

function getDefaultStateByProviders(
  providers: INSTANT_TRADES_PROVIDER[]
): ProviderControllerData[] {
  return providers.map(provider => ({
    ...defaultState,
    tradeProviderInfo: {
      label: instantTradesLabels[provider],
      value: provider
    }
  }));
}

export const INSTANT_TRADE_PROVIDERS: Partial<Record<BLOCKCHAIN_NAME, ProviderControllerData[]>> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDER.UNISWAP_V3,
    INSTANT_TRADES_PROVIDER.ONEINCH,
    INSTANT_TRADES_PROVIDER.UNISWAP_V2,
    INSTANT_TRADES_PROVIDER.SUSHISWAP,
    INSTANT_TRADES_PROVIDER.ZRX
  ]),
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDER.ONEINCH,
    INSTANT_TRADES_PROVIDER.PANCAKESWAP,
    INSTANT_TRADES_PROVIDER.SUSHISWAP
  ]),
  [BLOCKCHAIN_NAME.POLYGON]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDER.ALGEBRA,
    INSTANT_TRADES_PROVIDER.ONEINCH,
    INSTANT_TRADES_PROVIDER.QUICKSWAP,
    INSTANT_TRADES_PROVIDER.SUSHISWAP
  ]),
  [BLOCKCHAIN_NAME.HARMONY]: getDefaultStateByProviders([INSTANT_TRADES_PROVIDER.SUSHISWAP]),
  [BLOCKCHAIN_NAME.AVALANCHE]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDER.SUSHISWAP,
    INSTANT_TRADES_PROVIDER.PANGOLIN,
    INSTANT_TRADES_PROVIDER.JOE
  ]),
  [BLOCKCHAIN_NAME.MOONRIVER]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDER.SUSHISWAP,
    INSTANT_TRADES_PROVIDER.SOLARBEAM
  ]),
  [BLOCKCHAIN_NAME.FANTOM]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDER.SPOOKYSWAP,
    INSTANT_TRADES_PROVIDER.SPIRITSWAP,
    INSTANT_TRADES_PROVIDER.SUSHISWAP
  ]),
  [BLOCKCHAIN_NAME.SOLANA]: getDefaultStateByProviders([INSTANT_TRADES_PROVIDER.RAYDIUM])
};
