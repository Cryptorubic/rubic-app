import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { InstantTradeProvider } from '@shared/models/instant-trade/instant-trade-provider';

export const DefaultSlippageTolerance = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    [InstantTradeProvider.ONEINCH]: 2,
    [InstantTradeProvider.UNISWAP_V2]: 2,
    [InstantTradeProvider.UNISWAP_V3]: 2,
    [InstantTradeProvider.SUSHISWAP]: 2,
    [InstantTradeProvider.ZRX]: 2
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    [InstantTradeProvider.ONEINCH]: 2,
    [InstantTradeProvider.PANCAKESWAP]: 2,
    [InstantTradeProvider.SUSHISWAP]: 2
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    [InstantTradeProvider.ONEINCH]: 2,
    [InstantTradeProvider.QUICKSWAP]: 2,
    [InstantTradeProvider.SUSHISWAP]: 2,
    [InstantTradeProvider.ALGEBRA]: 2
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    [InstantTradeProvider.ONEINCH]: 2,
    [InstantTradeProvider.QUICKSWAP]: 2,
    [InstantTradeProvider.SUSHISWAP]: 2
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    [InstantTradeProvider.SUSHISWAP]: 2,
    [InstantTradeProvider.PANGOLIN]: 2,
    [InstantTradeProvider.JOE]: 2
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    [InstantTradeProvider.SOLARBEAM]: 2,
    [InstantTradeProvider.SUSHISWAP]: 2
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    [InstantTradeProvider.SUSHISWAP]: 2,
    [InstantTradeProvider.SPOOKYSWAP]: 2,
    [InstantTradeProvider.SPIRITSWAP]: 2
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    [InstantTradeProvider.RAYDIUM]: 2
  }
};
