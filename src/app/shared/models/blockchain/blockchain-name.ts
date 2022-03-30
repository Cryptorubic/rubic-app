export const ETH_LIKE_BLOCKCHAIN_NAME = {
  ETHEREUM: 'ETH',
  BINANCE_SMART_CHAIN: 'BSC',
  POLYGON: 'POLYGON',
  HARMONY: 'HARMONY',
  AVALANCHE: 'AVALANCHE',
  MOONRIVER: 'MOONRIVER',
  FANTOM: 'FANTOM',
  ARBITRUM: 'ARBITRUM',
  AURORA: 'AURORA'
} as const;

export type EthLikeBlockchainName =
  typeof ETH_LIKE_BLOCKCHAIN_NAME[keyof typeof ETH_LIKE_BLOCKCHAIN_NAME];

export type SolanaBlockchainName = 'SOLANA';

export type NearBlockchainName = 'NEAR';

export type BlockchainName = EthLikeBlockchainName | SolanaBlockchainName | NearBlockchainName;

export const BLOCKCHAIN_NAME = {
  ...ETH_LIKE_BLOCKCHAIN_NAME,
  SOLANA: 'SOLANA',
  NEAR: 'NEAR'
} as const;

export const ETH_LIKE_BLOCKCHAIN_NAMES = Object.values(ETH_LIKE_BLOCKCHAIN_NAME);

export const BLOCKCHAIN_NAMES = Object.values(BLOCKCHAIN_NAME);
