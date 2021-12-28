import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const SUPPORTED_ZRX_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.ETHEREUM_TESTNET
] as const;

export type SupportedZrxBlockchain = typeof SUPPORTED_ZRX_BLOCKCHAINS[number];
