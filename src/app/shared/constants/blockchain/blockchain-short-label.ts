import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { BlockchainName } from 'rubic-sdk';

export const blockchainShortLabel: Record<BlockchainName, string> = {
  ...blockchainLabel
};
