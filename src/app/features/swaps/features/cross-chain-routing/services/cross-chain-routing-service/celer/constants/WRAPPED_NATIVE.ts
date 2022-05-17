import { BlockchainName, BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';

export const WRAPPED_NATIVE: Partial<Record<BlockchainName, string>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  [BLOCKCHAIN_NAME.POLYGON]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  [BLOCKCHAIN_NAME.AVALANCHE]: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  [BLOCKCHAIN_NAME.FANTOM]: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  [BLOCKCHAIN_NAME.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
};
