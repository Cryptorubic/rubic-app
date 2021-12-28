import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const supportedZrxBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.ETHEREUM_TESTNET
] as const;

export type SupportedZrxBlockchain = typeof supportedZrxBlockchains[number];
