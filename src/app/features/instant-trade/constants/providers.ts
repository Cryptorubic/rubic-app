import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADES_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
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
  providers: INSTANT_TRADES_PROVIDERS[]
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
    INSTANT_TRADES_PROVIDERS.UNISWAP_V3,
    INSTANT_TRADES_PROVIDERS.ONEINCH,
    INSTANT_TRADES_PROVIDERS.UNISWAP_V2,
    INSTANT_TRADES_PROVIDERS.SUSHISWAP,
    INSTANT_TRADES_PROVIDERS.ZRX
  ]),
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDERS.ONEINCH,
    INSTANT_TRADES_PROVIDERS.PANCAKESWAP,
    INSTANT_TRADES_PROVIDERS.SUSHISWAP
  ]),
  [BLOCKCHAIN_NAME.POLYGON]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDERS.ALGEBRA,
    INSTANT_TRADES_PROVIDERS.ONEINCH,
    INSTANT_TRADES_PROVIDERS.QUICKSWAP,
    INSTANT_TRADES_PROVIDERS.SUSHISWAP
  ]),
  [BLOCKCHAIN_NAME.HARMONY]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDERS.SUSHISWAP,
    INSTANT_TRADES_PROVIDERS.VIPER
  ]),
  [BLOCKCHAIN_NAME.AVALANCHE]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDERS.SUSHISWAP,
    INSTANT_TRADES_PROVIDERS.PANGOLIN,
    INSTANT_TRADES_PROVIDERS.JOE
  ]),
  [BLOCKCHAIN_NAME.MOONRIVER]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDERS.SUSHISWAP,
    INSTANT_TRADES_PROVIDERS.SOLARBEAM
  ]),
  [BLOCKCHAIN_NAME.FANTOM]: getDefaultStateByProviders([
    INSTANT_TRADES_PROVIDERS.SPOOKYSWAP,
    INSTANT_TRADES_PROVIDERS.SPIRITSWAP,
    INSTANT_TRADES_PROVIDERS.SUSHISWAP
  ]),
  [BLOCKCHAIN_NAME.SOLANA]: getDefaultStateByProviders([INSTANT_TRADES_PROVIDERS.RAYDIUM])
};
