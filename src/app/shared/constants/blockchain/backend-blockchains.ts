import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const FROM_BACKEND_BLOCKCHAINS = {
  ethereum: BLOCKCHAIN_NAME.ETHEREUM,
  'binance-smart-chain': BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  polygon: BLOCKCHAIN_NAME.POLYGON,
  harmony: BLOCKCHAIN_NAME.HARMONY,
  avalanche: BLOCKCHAIN_NAME.AVALANCHE,
  moonriver: BLOCKCHAIN_NAME.MOONRIVER,
  fantom: BLOCKCHAIN_NAME.FANTOM,
  arbitrum: BLOCKCHAIN_NAME.ARBITRUM,
  aurora: BLOCKCHAIN_NAME.AURORA,
  solana: BLOCKCHAIN_NAME.SOLANA,
  near: BLOCKCHAIN_NAME.NEAR,
  'telos-evm': BLOCKCHAIN_NAME.TELOS
};

export const TO_BACKEND_BLOCKCHAINS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
  [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
  [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
  [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
  [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver',
  [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
  [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
  [BLOCKCHAIN_NAME.AURORA]: 'aurora',
  [BLOCKCHAIN_NAME.SOLANA]: 'solana',
  [BLOCKCHAIN_NAME.NEAR]: 'near',
  [BLOCKCHAIN_NAME.TELOS]: 'telos-evm'
};

export type ToBackendBlockchain = keyof typeof TO_BACKEND_BLOCKCHAINS;
export type FromBackendBlockchain = keyof typeof FROM_BACKEND_BLOCKCHAINS;
