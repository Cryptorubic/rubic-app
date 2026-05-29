import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';

export interface Blockchain {
  key: BlockchainName;
  name: string;
  img: string;
}

export const BLOCKCHAINS: Record<BlockchainName, Blockchain> = Object.fromEntries(
  Object.values(BLOCKCHAIN_NAME).map(blockchainName => [
    blockchainName,
    {
      key: blockchainName,
      name: blockchainLabel[blockchainName],
      img: blockchainIcon[blockchainName]
    }
  ])
) as Record<BlockchainName, Blockchain>;
