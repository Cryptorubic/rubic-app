import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const supportedCrossChainSwapBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.MOONRIVER,
  BLOCKCHAIN_NAME.FANTOM,
  BLOCKCHAIN_NAME.SOLANA
] as const;

export type SupportedCrossChainSwapBlockchain = typeof supportedCrossChainSwapBlockchains[number];
