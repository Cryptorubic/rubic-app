import { BLOCKCHAIN_NAMES, BlockchainName } from '@shared/models/blockchain/blockchain-name';

export function isBlockchainName(chain: string): chain is BlockchainName {
  return BLOCKCHAIN_NAMES.some(blockchainName => blockchainName === chain);
}
