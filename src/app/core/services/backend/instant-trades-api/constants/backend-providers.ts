import { TradeType, TRADE_TYPE } from 'rubic-sdk';

export const BACKEND_PROVIDERS: Record<TradeType, string> = {
  // Rubic integrated dexes
  [TRADE_TYPE.ALGEBRA]: 'algebra',
  [TRADE_TYPE.JOE]: 'joe',
  [TRADE_TYPE.ONE_INCH]: 'oneinch',
  [TRADE_TYPE.PANCAKE_SWAP]: 'pancakeswap',
  [TRADE_TYPE.PANGOLIN]: 'pangolin',
  [TRADE_TYPE.QUICK_SWAP]: 'quickswap',
  [TRADE_TYPE.RAYDIUM]: 'raydium',
  [TRADE_TYPE.SOLAR_BEAM]: 'solarbeam',
  [TRADE_TYPE.SPIRIT_SWAP]: 'spiritswap',
  [TRADE_TYPE.SPOOKY_SWAP]: 'spookyswap',
  [TRADE_TYPE.SUSHI_SWAP]: 'sushiswap',
  [TRADE_TYPE.TRISOLARIS]: 'trisolaris',
  [TRADE_TYPE.UNISWAP_V2]: 'uniswap',
  [TRADE_TYPE.UNI_SWAP_V3]: 'uniswap3',
  [TRADE_TYPE.VIPER_SWAP]: 'viper',
  [TRADE_TYPE.WANNA_SWAP]: 'wannaswap',
  [TRADE_TYPE.WRAPPED]: 'wrapped',
  [TRADE_TYPE.ZAPPY]: 'zappy',
  [TRADE_TYPE.ZRX]: 'zerox',

  // Li-fi dexes
  [TRADE_TYPE.CRONA_SWAP]: 'lifi',
  [TRADE_TYPE.BEAM_SWAP]: 'lifi',
  [TRADE_TYPE.HONEY_SWAP]: 'lifi',
  [TRADE_TYPE.DODO]: 'lifi',
  [TRADE_TYPE.J_SWAP]: 'lifi',
  [TRADE_TYPE.OPEN_OCEAN]: 'lifi',
  [TRADE_TYPE.REF_FINANCE]: 'lifi',
  [TRADE_TYPE.PARA_SWAP]: 'lifi',
  [TRADE_TYPE.STELLA_SWAP]: 'lifi',
  [TRADE_TYPE.UBE_SWAP]: 'lifi'
};
