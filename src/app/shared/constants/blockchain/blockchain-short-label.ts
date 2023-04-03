import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const blockchainShortLabel: Record<BlockchainName, string> = {
  ...blockchainLabel,
  [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: 'Boba AVX'
};
