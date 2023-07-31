import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { instantTradesLabels } from '@shared/constants/instant-trade/instant-trades-labels';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from 'rubic-sdk';
import { SupportedOnChainNetworks } from '@features/swaps/features/instant-trade/constants/instant-trade.type';

const defaultState: Omit<InstantTradeProviderData, 'name' | 'label'> = {
  trade: null,
  tradeStatus: INSTANT_TRADE_STATUS.CALCULATION,
  isSelected: false,
  needApprove: false
};

function getDefaultStateByProviders(providers: OnChainTradeType[]): InstantTradeProviderData[] {
  return [
    ...providers.map(provider => ({
      ...defaultState,
      name: provider,
      label: instantTradesLabels[provider]
    })),
    {
      ...defaultState,
      name: ON_CHAIN_TRADE_TYPE.WRAPPED,
      label: instantTradesLabels[ON_CHAIN_TRADE_TYPE.WRAPPED]
    }
  ];
}

export const INSTANT_TRADE_PROVIDERS: Record<SupportedOnChainNetworks, InstantTradeProviderData[]> =
  {
    [BLOCKCHAIN_NAME.ETHEREUM]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3,
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.UNISWAP_V2,
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.PARA_SWAP,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
      // ON_CHAIN_TRADE_TYPE.DODO,
      // ON_CHAIN_TRADE_TYPE.ZRX,
      ON_CHAIN_TRADE_TYPE.CURVE,
      ON_CHAIN_TRADE_TYPE.VERSE,
      ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP
    ]),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP,
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.PARA_SWAP,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN
      // ON_CHAIN_TRADE_TYPE.DODO,
      // ON_CHAIN_TRADE_TYPE.CURVE,
      // ON_CHAIN_TRADE_TYPE.ZRX
    ]),
    [BLOCKCHAIN_NAME.POLYGON]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3,
      // ON_CHAIN_TRADE_TYPE.ALGEBRA,
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.QUICK_SWAP,
      ON_CHAIN_TRADE_TYPE.QUICK_SWAP_V3,
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.PARA_SWAP,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
      // ON_CHAIN_TRADE_TYPE.DODO,
      ON_CHAIN_TRADE_TYPE.HONEY_SWAP,
      // ON_CHAIN_TRADE_TYPE.ZRX,
      ON_CHAIN_TRADE_TYPE.CURVE
    ]),
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.QUICK_SWAP_V3,
      ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP
    ]),
    [BLOCKCHAIN_NAME.HARMONY]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.VIPER_SWAP
    ]),
    [BLOCKCHAIN_NAME.AVALANCHE]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.PANGOLIN,
      ON_CHAIN_TRADE_TYPE.JOE,
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.PARA_SWAP,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
      // ON_CHAIN_TRADE_TYPE.ZRX,
      ON_CHAIN_TRADE_TYPE.CURVE
    ]),
    [BLOCKCHAIN_NAME.MOONRIVER]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.SOLAR_BEAM
      // ON_CHAIN_TRADE_TYPE.DODO
    ]),
    [BLOCKCHAIN_NAME.FANTOM]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP,
      ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP,
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
      ON_CHAIN_TRADE_TYPE.PARA_SWAP,
      // ON_CHAIN_TRADE_TYPE.ZRX,
      ON_CHAIN_TRADE_TYPE.SOUL_SWAP,
      ON_CHAIN_TRADE_TYPE.CURVE
    ]),
    [BLOCKCHAIN_NAME.ARBITRUM]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
      // ON_CHAIN_TRADE_TYPE.DODO,
      ON_CHAIN_TRADE_TYPE.CURVE
    ]),
    [BLOCKCHAIN_NAME.AURORA]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.TRISOLARIS,
      ON_CHAIN_TRADE_TYPE.WANNA_SWAP,
      ON_CHAIN_TRADE_TYPE.ONE_INCH
    ]),
    [BLOCKCHAIN_NAME.TELOS]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.ZAPPY,
      ON_CHAIN_TRADE_TYPE.APE_SWAP,
      ON_CHAIN_TRADE_TYPE.OMNIDEX
    ]),
    [BLOCKCHAIN_NAME.OPTIMISM]: getDefaultStateByProviders([
      // ON_CHAIN_TRADE_TYPE.ZRX,
      ON_CHAIN_TRADE_TYPE.CURVE,
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN
      // ON_CHAIN_TRADE_TYPE.DODO
    ]),
    [BLOCKCHAIN_NAME.CRONOS]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.CRONA_SWAP,
      ON_CHAIN_TRADE_TYPE.CRO_SWAP,
      ON_CHAIN_TRADE_TYPE.CRO_DEX
    ]),
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.J_SWAP,
      // ON_CHAIN_TRADE_TYPE.DODO
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN
    ]),
    [BLOCKCHAIN_NAME.GNOSIS]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.ONE_INCH,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
      ON_CHAIN_TRADE_TYPE.HONEY_SWAP,
      ON_CHAIN_TRADE_TYPE.CURVE
    ]),
    [BLOCKCHAIN_NAME.FUSE]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.SUSHI_SWAP]),
    [BLOCKCHAIN_NAME.MOONBEAM]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.STELLA_SWAP,
      ON_CHAIN_TRADE_TYPE.BEAM_SWAP
    ]),
    [BLOCKCHAIN_NAME.CELO]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.UBE_SWAP,
      ON_CHAIN_TRADE_TYPE.CURVE
    ]),
    [BLOCKCHAIN_NAME.BOBA]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.OOLONG_SWAP,
      ON_CHAIN_TRADE_TYPE.OPEN_OCEAN
    ]),
    [BLOCKCHAIN_NAME.ETHEREUM_POW]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
      ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3,
      ON_CHAIN_TRADE_TYPE.UNISWAP_V2
    ]),
    [BLOCKCHAIN_NAME.KAVA]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.JUPITER_SWAP,
      ON_CHAIN_TRADE_TYPE.PHOTON_SWAP,
      ON_CHAIN_TRADE_TYPE.ELK,
      ON_CHAIN_TRADE_TYPE.SURFDEX
    ]),
    [BLOCKCHAIN_NAME.TRON]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.BRIDGERS]),
    [BLOCKCHAIN_NAME.OASIS]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.YUZU_SWAP]),
    [BLOCKCHAIN_NAME.METIS]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.NET_SWAP]),
    [BLOCKCHAIN_NAME.KLAYTN]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.CLAIM_SWAP]),
    [BLOCKCHAIN_NAME.VELAS]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.WAGYU_SWAP,
      ON_CHAIN_TRADE_TYPE.ASTRO_SWAP
    ]),
    [BLOCKCHAIN_NAME.SYSCOIN]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.PEGASYS]),
    [BLOCKCHAIN_NAME.ASTAR_EVM]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.ARTH_SWAP]),
    [BLOCKCHAIN_NAME.ZK_SYNC]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.MUTE_SWAP,
      ON_CHAIN_TRADE_TYPE.SYNC_SWAP,
      ON_CHAIN_TRADE_TYPE.ONE_INCH
    ]),
    [BLOCKCHAIN_NAME.PULSECHAIN]: getDefaultStateByProviders([
      ON_CHAIN_TRADE_TYPE.PULSEX_V1,
      ON_CHAIN_TRADE_TYPE.PULSEX_V2,
      ON_CHAIN_TRADE_TYPE.UNISWAP_V2,
      ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3,
      ON_CHAIN_TRADE_TYPE.SUSHI_SWAP
    ]),
    [BLOCKCHAIN_NAME.LINEA]: getDefaultStateByProviders([ON_CHAIN_TRADE_TYPE.OPEN_OCEAN])
  };
