import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';

export const PRIVATE_MODE_SUPPORTED_CHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.BASE,
  BLOCKCHAIN_NAME.OPTIMISM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.SOLANA,
  BLOCKCHAIN_NAME.TRON
] as const;

export type PrivateModeSupportedChain = (typeof PRIVATE_MODE_SUPPORTED_CHAINS)[number];

export const isPrivateModeSupportedChain = (
  blockchain: BlockchainName
): blockchain is PrivateModeSupportedChain =>
  (PRIVATE_MODE_SUPPORTED_CHAINS as readonly BlockchainName[]).includes(blockchain);
