import { OnChainTradeType, ON_CHAIN_TRADE_TYPE } from 'rubic-sdk';

export const BACKEND_PROVIDERS: Partial<Record<OnChainTradeType, string>> = {
  // Rubic integrated dexes
  [ON_CHAIN_TRADE_TYPE.ALGEBRA]: 'algebra',
  [ON_CHAIN_TRADE_TYPE.JOE]: 'joe',
  [ON_CHAIN_TRADE_TYPE.ONE_INCH]: 'oneinch',
  [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP]: 'pancakeswap',
  [ON_CHAIN_TRADE_TYPE.PANGOLIN]: 'pangolin',
  [ON_CHAIN_TRADE_TYPE.QUICK_SWAP]: 'quickswap',
  [ON_CHAIN_TRADE_TYPE.RAYDIUM]: 'raydium',
  [ON_CHAIN_TRADE_TYPE.SOLAR_BEAM]: 'solarbeam',
  [ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP]: 'spiritswap',
  [ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP]: 'spookyswap',
  [ON_CHAIN_TRADE_TYPE.SUSHI_SWAP]: 'sushiswap',
  [ON_CHAIN_TRADE_TYPE.TRISOLARIS]: 'trisolaris',
  [ON_CHAIN_TRADE_TYPE.UNISWAP_V2]: 'uniswap',
  [ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3]: 'uniswap3',
  [ON_CHAIN_TRADE_TYPE.VIPER_SWAP]: 'viper',
  [ON_CHAIN_TRADE_TYPE.WANNA_SWAP]: 'wannaswap',
  [ON_CHAIN_TRADE_TYPE.WRAPPED]: 'wrapped',
  [ON_CHAIN_TRADE_TYPE.ZAPPY]: 'zappy',
  [ON_CHAIN_TRADE_TYPE.ZRX]: 'zerox',
  [ON_CHAIN_TRADE_TYPE.OOLONG_SWAP]: 'oolong',

  // Li-fi dexes
  [ON_CHAIN_TRADE_TYPE.CRONA_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.BEAM_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.HONEY_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.DODO]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.J_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.OPEN_OCEAN]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.REF_FINANCE]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.PARA_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.STELLA_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.UBE_SWAP]: 'lifi',

  [ON_CHAIN_TRADE_TYPE.REN_BTC]: 'renbtc'
};
