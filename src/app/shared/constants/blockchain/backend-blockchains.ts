import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const FROM_BACKEND_BLOCKCHAINS = {
  ethereum: BLOCKCHAIN_NAME.ETHEREUM,
  'binance-smart-chain': BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  polygon: BLOCKCHAIN_NAME.POLYGON,
  harmony: BLOCKCHAIN_NAME.HARMONY,
  avalanche: BLOCKCHAIN_NAME.AVALANCHE,
  xdai: BLOCKCHAIN_NAME.XDAI,
  moonriver: BLOCKCHAIN_NAME.MOONRIVER,
  fantom: BLOCKCHAIN_NAME.FANTOM,
  'ethereum-test': BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
  solana: BLOCKCHAIN_NAME.SOLANA
};

export const TO_BACKEND_BLOCKCHAINS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
  [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
  [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
  [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
  [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver',
  [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
  [BLOCKCHAIN_NAME.XDAI]: 'xdai',
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: 'ethereum-test',
  [BLOCKCHAIN_NAME.SOLANA]: 'solana'
};

export type ToBackendBlockchain = keyof typeof TO_BACKEND_BLOCKCHAINS;
export type FromBackendBlockchain = keyof typeof FROM_BACKEND_BLOCKCHAINS;
