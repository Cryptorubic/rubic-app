import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const CCR_LONG_TIMEOUT_CHAINS: Readonly<BlockchainName[]> = [
  BLOCKCHAIN_NAME.XLAYER,
  BLOCKCHAIN_NAME.ROOTSTOCK
] as const;
