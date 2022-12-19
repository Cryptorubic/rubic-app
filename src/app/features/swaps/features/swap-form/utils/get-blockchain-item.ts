import { BlockchainName } from 'rubic-sdk';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { AssetTypeItem } from '@features/swaps/features/swap-form/models/asset-type-item';

export function getBlockchainItem(blockchain: BlockchainName): AssetTypeItem {
  return {
    icon: blockchainIcon[blockchain],
    label: blockchainLabel[blockchain]
  };
}
