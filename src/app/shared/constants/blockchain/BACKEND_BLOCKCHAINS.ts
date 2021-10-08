import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

export const FROM_BACKEND_BLOCKCHAINS = {
  ethereum: BLOCKCHAIN_NAME.ETHEREUM,
  'binance-smart-chain': BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  polygon: BLOCKCHAIN_NAME.POLYGON,
  'tron-mainnet': BLOCKCHAIN_NAME.TRON,
  xdai: BLOCKCHAIN_NAME.XDAI,
  harmony: BLOCKCHAIN_NAME.HARMONY,
  'ethereum-test': BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
  avalanche: BLOCKCHAIN_NAME.AVALANCHE
};

export const TO_BACKEND_BLOCKCHAINS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
  [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
  [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
  [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: 'ethereum-test',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: 'binance-test',
  [BLOCKCHAIN_NAME.POLYGON_TESTNET]: 'polygon-test',
  [BLOCKCHAIN_NAME.HARMONY_TESTNET]: 'harmony-test',
  [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: 'avalanche-test'
};

export type ToBackendBlockchains = keyof typeof TO_BACKEND_BLOCKCHAINS;
export type FromBackendBlockchains = keyof typeof FROM_BACKEND_BLOCKCHAINS;
