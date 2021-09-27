import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const supportedZrxBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.ETHEREUM_TESTNET
] as const;

export type SupportedZrxBlockchain = typeof supportedZrxBlockchains[number];
