import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { instantTradesLabels } from '@features/swaps/shared/constants/instant-trades-labels';

const defaultState: Omit<InstantTradeProviderData, 'name' | 'label'> = {
  trade: null,
  tradeStatus: INSTANT_TRADE_STATUS.CALCULATION,
  isSelected: false,
  needApprove: false
};

function getDefaultStateByProviders(
  providers: INSTANT_TRADE_PROVIDER[]
): InstantTradeProviderData[] {
  return providers.map(provider => ({
    ...defaultState,
    name: provider,
    label: instantTradesLabels[provider]
  }));
}

export const INSTANT_TRADE_PROVIDERS: Partial<Record<BlockchainName, InstantTradeProviderData[]>> =
  {
    [BLOCKCHAIN_NAME.ETHEREUM]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.UNISWAP_V3,
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.UNISWAP_V2,
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.ZRX
    ]),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.PANCAKESWAP,
      INSTANT_TRADE_PROVIDER.SUSHISWAP
    ]),
    [BLOCKCHAIN_NAME.POLYGON]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.UNISWAP_V3,
      INSTANT_TRADE_PROVIDER.ALGEBRA,
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.QUICKSWAP,
      INSTANT_TRADE_PROVIDER.SUSHISWAP
    ]),
    [BLOCKCHAIN_NAME.HARMONY]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.VIPER
    ]),
    [BLOCKCHAIN_NAME.AVALANCHE]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.PANGOLIN,
      INSTANT_TRADE_PROVIDER.JOE,
      INSTANT_TRADE_PROVIDER.ONEINCH
    ]),
    [BLOCKCHAIN_NAME.MOONRIVER]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.SOLARBEAM
    ]),
    [BLOCKCHAIN_NAME.FANTOM]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SPOOKYSWAP,
      INSTANT_TRADE_PROVIDER.SPIRITSWAP,
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.ONEINCH
    ]),
    [BLOCKCHAIN_NAME.ARBITRUM]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.UNISWAP_V3
    ]),
    [BLOCKCHAIN_NAME.AURORA]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.TRISOLARIS,
      INSTANT_TRADE_PROVIDER.WANNASWAP
    ]),
    [BLOCKCHAIN_NAME.SOLANA]: getDefaultStateByProviders([INSTANT_TRADE_PROVIDER.RAYDIUM]),
    [BLOCKCHAIN_NAME.NEAR]: getDefaultStateByProviders([INSTANT_TRADE_PROVIDER.REF]),
    [BLOCKCHAIN_NAME.TELOS]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.ZAPPY
    ])
  };
