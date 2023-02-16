import { BlockchainName } from 'rubic-sdk';
import { notEvmChangeNowBlockchainsList } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';

export const disabledFromBlockchains: BlockchainName[] = [...notEvmChangeNowBlockchainsList];
