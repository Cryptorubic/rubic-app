import { BlockchainName } from 'rubic-sdk';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { BlockchainItem } from '@features/swaps/features/swaps-form/models/blockchain-item';

export function getBlockchainItem(blockchain: BlockchainName): BlockchainItem {
  return {
    icon: blockchainIcon[blockchain],
    label: blockchainLabel[blockchain]
  };
}
