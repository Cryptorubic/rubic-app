import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';

export const toBridgersBlockchain: Partial<Record<BlockchainName, string>> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
  [BLOCKCHAIN_NAME.POLYGON]: 'POLYGON',
  [BLOCKCHAIN_NAME.FANTOM]: 'FANTOM',
  [BLOCKCHAIN_NAME.TRON]: 'TRX'
};
