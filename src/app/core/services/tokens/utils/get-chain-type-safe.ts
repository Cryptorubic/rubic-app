import { BlockchainName, BlockchainsInfo, ChainType } from '@cryptorubic/core';

export function getChainTypeSafe(chain: BlockchainName): ChainType | null {
  try {
    return BlockchainsInfo.getChainType(chain);
  } catch {
    return null;
  }
}
