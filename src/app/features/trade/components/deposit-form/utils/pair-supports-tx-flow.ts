import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';

export function pairSupportsDepositFlowViaTxSign(srcChain: BlockchainName): boolean {
  return BlockchainsInfo.isEvmBlockchainName(srcChain);
}
