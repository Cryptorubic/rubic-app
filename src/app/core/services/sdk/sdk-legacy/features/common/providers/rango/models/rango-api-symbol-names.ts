import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { RangoSupportedBlockchain } from './rango-supported-blockchains';

export const rangoApiSymbols: Record<RangoSupportedBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
  [BLOCKCHAIN_NAME.POLYGON]: 'MATIC',
  [BLOCKCHAIN_NAME.OPTIMISM]: 'ETH',
  [BLOCKCHAIN_NAME.ARBITRUM]: 'ETH',
  [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BNB',
  [BLOCKCHAIN_NAME.CRONOS]: 'CRO',
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'ETH',
  [BLOCKCHAIN_NAME.AURORA]: 'ETH',
  [BLOCKCHAIN_NAME.BASE]: 'ETH',
  [BLOCKCHAIN_NAME.ZK_SYNC]: 'ETH',
  [BLOCKCHAIN_NAME.LINEA]: 'ETH',
  [BLOCKCHAIN_NAME.METIS]: 'METIS',
  // [BLOCKCHAIN_NAME.FANTOM]: 'FTM',
  [BLOCKCHAIN_NAME.BLAST]: 'ETH',
  [BLOCKCHAIN_NAME.SCROLL]: 'ETH'
  // [BLOCKCHAIN_NAME.BITCOIN]: 'BTC'
};

export type RangoSymbols = keyof typeof rangoApiSymbols;
