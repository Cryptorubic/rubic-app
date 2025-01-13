import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export function sortFaucets(currChain: BlockchainName, _prevChain: BlockchainName): number {
  if (currChain === BLOCKCHAIN_NAME.SONEIUM_TESTNET) return -1;
  if (currChain === BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET) return -1;
  return 1;
}
