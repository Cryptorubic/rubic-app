import { BRIDGE_TYPE, BridgeType } from '../../../../cross-chain/calculation-manager/providers/common/models/bridge-type';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../../on-chain/calculation-manager/models/on-chain-trade-type';

const RANGO_TO_RUBIC_ON_CHAIN_PROVIDERS = {
    '10KSwap': ON_CHAIN_TRADE_TYPE['10K_SWAP'],
    'Pangolin Swap': ON_CHAIN_TRADE_TYPE.PANGOLIN,
    'Sushi Swap': ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    Osmosis: ON_CHAIN_TRADE_TYPE.OSMOSIS_SWAP,
    UniSwapV2: ON_CHAIN_TRADE_TYPE.UNISWAP_V2,
    'VVS Finance': ON_CHAIN_TRADE_TYPE.VVS_FINANCE,
    'MM Finance': ON_CHAIN_TRADE_TYPE.MM_FINANCE,
    'Crona Swap': ON_CHAIN_TRADE_TYPE.CRONA_SWAP,
    'Oolong Swap': ON_CHAIN_TRADE_TYPE.OOLONG_SWAP,
    'Trisolaris Swap': ON_CHAIN_TRADE_TYPE.TRISOLARIS,
    'Mojito Swap': ON_CHAIN_TRADE_TYPE.MOJITO_SWAP,
    Netswap: ON_CHAIN_TRADE_TYPE.NET_SWAP,
    'Voltage Swap': ON_CHAIN_TRADE_TYPE.VOLTAGE_SWAP,
    PancakeV2: ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP,
    PancakeV3: ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP_V3,
    UniSwapV3: ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3,
    KyberSwapV3: ON_CHAIN_TRADE_TYPE.KYBER_SWAP,
    Jupiter: ON_CHAIN_TRADE_TYPE.JUPITER,
    'Open Ocean': ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    CurveFi: ON_CHAIN_TRADE_TYPE.CURVE,
    'Quick Swap': ON_CHAIN_TRADE_TYPE.QUICK_SWAP,
    'XY Finance': ON_CHAIN_TRADE_TYPE.XY_DEX,
    Solarbeam: ON_CHAIN_TRADE_TYPE.SOLAR_BEAM,
    'Aurora Swap': ON_CHAIN_TRADE_TYPE.AURORA_SWAP,
    'Stella Swap': ON_CHAIN_TRADE_TYPE.STELLA_SWAP,
    '1Inch': ON_CHAIN_TRADE_TYPE.ONE_INCH,
    'Beam Swap': ON_CHAIN_TRADE_TYPE.BEAM_SWAP,
    ParaSwap: ON_CHAIN_TRADE_TYPE.PARA_SWAP,
    'Synapse Swapper': ON_CHAIN_TRADE_TYPE.SYNAPSE,
    'Fin Kujira': ON_CHAIN_TRADE_TYPE.FINKUJIRA,
    'Solana Wrapper': ON_CHAIN_TRADE_TYPE.SOLANA,
    Avnu: ON_CHAIN_TRADE_TYPE.AVNU,
    EchoDEX: ON_CHAIN_TRADE_TYPE.ECHO_DEX,
    SpaceFi: ON_CHAIN_TRADE_TYPE.SPACEFI_SWAP,
    'Wynd Dex': ON_CHAIN_TRADE_TYPE.WYND,
    'Sun Swap': ON_CHAIN_TRADE_TYPE.SUN_SWAP,
    MDex: ON_CHAIN_TRADE_TYPE.MDEX,
    'Okc Swap': ON_CHAIN_TRADE_TYPE.OKC_SWAP,
    'Cherry Swap': ON_CHAIN_TRADE_TYPE.CHERRY_SWAP
    // If you need to disable manually some dex or bridge in code and this dex/bridge not included in config - you can get
    // full list of rango dexes here https://api.rango.exchange/basic/meta/swappers?apiKey=c6381a79-2817-4602-83bf-6a641a409e32
} as const;

export const RUBIC_TO_RANGO_ON_CHAIN_PROVIDERS = Object.entries(RANGO_TO_RUBIC_ON_CHAIN_PROVIDERS).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {} as Record<OnChainTradeType, RangoOnChainTradeType>
);

const RANGO_TO_RUBIC_CROSS_CHAIN_PROVIDERS = {
    Across: BRIDGE_TYPE.ACROSS,
    Voyager: BRIDGE_TYPE.VOYAGER,
    CBridge: BRIDGE_TYPE.CBRIDGE,
    'Rainbow Bridge': BRIDGE_TYPE.RAINBOW,
    'Synapse Bridge': BRIDGE_TYPE.SYNAPSE,
    'Optimism Bridge': BRIDGE_TYPE.OPTIMISM_GATEWAY,
    Orbiter: BRIDGE_TYPE.ORBITER_BRIDGE,
    'Maya Protocol': BRIDGE_TYPE.MAYA_PROTOCOL,
    'XY Finance': BRIDGE_TYPE.XY,
    ThorChain: BRIDGE_TYPE.THORCHAIN,
    'Arbitrum Bridge': BRIDGE_TYPE.ARBITRUM_BRIDGE,
    AllBridge: BRIDGE_TYPE.ALLBRIDGE,
    Hyphen: BRIDGE_TYPE.HYPHEN,
    Circle: BRIDGE_TYPE.CIRCLE_CELER_BRIDGE,
    IBC: BRIDGE_TYPE.IBC,
    Stargate: BRIDGE_TYPE.STARGATE,
    Satellite: BRIDGE_TYPE.SATELLITE,
    Symbiosis: BRIDGE_TYPE.SYMBIOSIS,
    Osmosis: BRIDGE_TYPE.OSMOSIS_BRIDGE
    // Full list rango bridges here https://api.rango.exchange/basic/meta/swappers?apiKey=c6381a79-2817-4602-83bf-6a641a409e32
} as const;

export const RANGO_TO_RUBIC_PROVIDERS = {
    ...RANGO_TO_RUBIC_ON_CHAIN_PROVIDERS,
    ...RANGO_TO_RUBIC_CROSS_CHAIN_PROVIDERS
} as const;

export const RUBIC_TO_RANGO_PROVIDERS = Object.entries(RANGO_TO_RUBIC_PROVIDERS).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {} as Record<OnChainTradeType | BridgeType, RangoTradeType>
);

export type RubicOnChainTradeTypeForRango = (typeof RANGO_TO_RUBIC_ON_CHAIN_PROVIDERS)[keyof typeof RANGO_TO_RUBIC_ON_CHAIN_PROVIDERS];

export type RangoOnChainTradeType = keyof typeof RANGO_TO_RUBIC_ON_CHAIN_PROVIDERS;

export type RangoTradeType = keyof typeof RANGO_TO_RUBIC_PROVIDERS;
