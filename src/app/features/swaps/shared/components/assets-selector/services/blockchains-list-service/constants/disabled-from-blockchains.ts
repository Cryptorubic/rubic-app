import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const disabledFromBlockchains: BlockchainName[] = [
  BLOCKCHAIN_NAME.BITCOIN,
  BLOCKCHAIN_NAME.SOLANA,
  BLOCKCHAIN_NAME.NEAR
];
