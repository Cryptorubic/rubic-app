import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export function sortFaucets(currChain: BlockchainName, prevChain: BlockchainName): number {
  if (currChain === BLOCKCHAIN_NAME.SONEIUM_TESTNET) return -1;
  if (currChain === BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET) return -1;
  if (prevChain === BLOCKCHAIN_NAME.MONAD_TESTNET && currChain === BLOCKCHAIN_NAME.MEGAETH_TESTNET)
    return -1;
  return 1;
}
