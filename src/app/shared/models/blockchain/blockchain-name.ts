export const ETH_LIKE_BLOCKCHAIN_NAME = {
  ETHEREUM: 'ETH',
  BINANCE_SMART_CHAIN: 'BSC',
  POLYGON: 'POLYGON',
  HARMONY: 'HARMONY',
  AVALANCHE: 'AVALANCHE',
  MOONRIVER: 'MOONRIVER',
  FANTOM: 'FANTOM',
  ARBITRUM: 'ARBITRUM',
  AURORA: 'AURORA',
  TELOS: 'TELOS'
} as const;

export const SOLANA_BLOCKCHAIN_NAME = 'SOLANA' as const;

export const NEAR_BLOCKCHAIN_NAME = 'NEAR' as const;

export const BLOCKCHAIN_NAME = {
  ...ETH_LIKE_BLOCKCHAIN_NAME,
  SOLANA: SOLANA_BLOCKCHAIN_NAME,
  NEAR: NEAR_BLOCKCHAIN_NAME
} as const;

export type EthLikeBlockchainName =
  typeof ETH_LIKE_BLOCKCHAIN_NAME[keyof typeof ETH_LIKE_BLOCKCHAIN_NAME];

export type SolanaBlockchainName = typeof SOLANA_BLOCKCHAIN_NAME;

export type NearBlockchainName = typeof NEAR_BLOCKCHAIN_NAME;

export type BlockchainName = typeof BLOCKCHAIN_NAME[keyof typeof BLOCKCHAIN_NAME];

export const ETH_LIKE_BLOCKCHAIN_NAMES = Object.values(ETH_LIKE_BLOCKCHAIN_NAME);

export const BLOCKCHAIN_NAMES = Object.values(BLOCKCHAIN_NAME);
