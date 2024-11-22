import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const ON_CHAIN_LONG_TIMEOUT_CHAINS: Readonly<BlockchainName[]> = [
  BLOCKCHAIN_NAME.MERLIN,
  BLOCKCHAIN_NAME.FLARE
] as const;
