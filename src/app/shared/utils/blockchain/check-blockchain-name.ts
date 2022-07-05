import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export function isBlockchainName(chain: string): chain is BlockchainName {
  return Object.values(BLOCKCHAIN_NAME).some(blockchainName => blockchainName === chain);
}
