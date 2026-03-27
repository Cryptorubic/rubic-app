import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';

export const CLEARSWAP_SUPPORTED_CHAINS = [BLOCKCHAIN_NAME.TRON] as const;

export type ClearswapSupportedChain = (typeof CLEARSWAP_SUPPORTED_CHAINS)[number];

export function isClearswapSupportedChain(
  blockchain: BlockchainName
): blockchain is ClearswapSupportedChain {
  return (CLEARSWAP_SUPPORTED_CHAINS as Readonly<BlockchainName[]>).includes(blockchain);
}
