import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { instantTradesLabels } from '@shared/constants/instant-trade/instant-trades-labels';
import { TRADE_TYPE, TradeType } from 'rubic-sdk';

const defaultState: Omit<InstantTradeProviderData, 'name' | 'label'> = {
  trade: null,
  tradeStatus: INSTANT_TRADE_STATUS.CALCULATION,
  isSelected: false,
  needApprove: false
};

function getDefaultStateByProviders(providers: TradeType[]): InstantTradeProviderData[] {
  return providers.map(provider => ({
    ...defaultState,
    name: provider,
    label: instantTradesLabels[provider]
  }));
}

export const INSTANT_TRADE_PROVIDERS: Record<BlockchainName, InstantTradeProviderData[]> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: getDefaultStateByProviders([
    TRADE_TYPE.UNI_SWAP_V3,
    TRADE_TYPE.ONE_INCH,
    TRADE_TYPE.UNISWAP_V2,
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.PARA_SWAP,
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.DODO,
    TRADE_TYPE.ZRX
  ]),
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: getDefaultStateByProviders([
    TRADE_TYPE.ONE_INCH,
    TRADE_TYPE.PANCAKE_SWAP,
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.PARA_SWAP,
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.DODO,
    TRADE_TYPE.ZRX
  ]),
  [BLOCKCHAIN_NAME.POLYGON]: getDefaultStateByProviders([
    TRADE_TYPE.UNI_SWAP_V3,
    TRADE_TYPE.ALGEBRA,
    TRADE_TYPE.ONE_INCH,
    TRADE_TYPE.QUICK_SWAP,
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.PARA_SWAP,
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.DODO,
    TRADE_TYPE.HONEY_SWAP,
    TRADE_TYPE.ZRX
  ]),
  [BLOCKCHAIN_NAME.HARMONY]: getDefaultStateByProviders([
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.VIPER_SWAP
  ]),
  [BLOCKCHAIN_NAME.AVALANCHE]: getDefaultStateByProviders([
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.PANGOLIN,
    TRADE_TYPE.JOE,
    TRADE_TYPE.ONE_INCH,
    TRADE_TYPE.PARA_SWAP,
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.ZRX
  ]),
  [BLOCKCHAIN_NAME.MOONRIVER]: getDefaultStateByProviders([
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.SOLAR_BEAM,
    TRADE_TYPE.DODO
  ]),
  [BLOCKCHAIN_NAME.FANTOM]: getDefaultStateByProviders([
    TRADE_TYPE.SPOOKY_SWAP,
    TRADE_TYPE.SPIRIT_SWAP,
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.ONE_INCH,
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.PARA_SWAP,
    TRADE_TYPE.ZRX
  ]),
  [BLOCKCHAIN_NAME.ARBITRUM]: getDefaultStateByProviders([
    TRADE_TYPE.ONE_INCH,
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.UNI_SWAP_V3,
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.DODO
  ]),
  [BLOCKCHAIN_NAME.AURORA]: getDefaultStateByProviders([
    TRADE_TYPE.TRISOLARIS,
    TRADE_TYPE.WANNA_SWAP
  ]),
  [BLOCKCHAIN_NAME.SOLANA]: getDefaultStateByProviders([TRADE_TYPE.RAYDIUM]),
  [BLOCKCHAIN_NAME.NEAR]: getDefaultStateByProviders([TRADE_TYPE.REF_FINANCE]),
  [BLOCKCHAIN_NAME.TELOS]: getDefaultStateByProviders([TRADE_TYPE.SUSHI_SWAP, TRADE_TYPE.ZAPPY]),
  [BLOCKCHAIN_NAME.OPTIMISM]: getDefaultStateByProviders([TRADE_TYPE.ZRX]),
  [BLOCKCHAIN_NAME.CRONOS]: getDefaultStateByProviders([
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.CRONA_SWAP
  ]),
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: getDefaultStateByProviders([
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.J_SWAP,
    TRADE_TYPE.DODO
  ]),
  [BLOCKCHAIN_NAME.GNOSIS]: getDefaultStateByProviders([
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.ONE_INCH,
    TRADE_TYPE.OPEN_OCEAN,
    TRADE_TYPE.HONEY_SWAP
  ]),
  [BLOCKCHAIN_NAME.FUSE]: getDefaultStateByProviders([TRADE_TYPE.SUSHI_SWAP]),
  [BLOCKCHAIN_NAME.MOONBEAM]: getDefaultStateByProviders([
    TRADE_TYPE.STELLA_SWAP,
    TRADE_TYPE.BEAM_SWAP
  ]),
  [BLOCKCHAIN_NAME.CELO]: getDefaultStateByProviders([TRADE_TYPE.SUSHI_SWAP, TRADE_TYPE.UBE_SWAP]),
  [BLOCKCHAIN_NAME.BOBA]: getDefaultStateByProviders([TRADE_TYPE.OOLONG_SWAP]),
  [BLOCKCHAIN_NAME.ASTAR]: getDefaultStateByProviders([]),
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: getDefaultStateByProviders([
    TRADE_TYPE.SUSHI_SWAP,
    TRADE_TYPE.UNI_SWAP_V3,
    TRADE_TYPE.UNISWAP_V2
  ]),
  [BLOCKCHAIN_NAME.BITCOIN]: getDefaultStateByProviders([]),
  [BLOCKCHAIN_NAME.TRON]: getDefaultStateByProviders([])
};
