import { BLOCKCHAIN_NAME, compareAddresses, EvmBlockchainName } from '@cryptorubic/core';

const NEED_RESET_APPROVE_TOKENS: Partial<Record<EvmBlockchainName, string[]>> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT
  ]
};

export function needResetPrevApprove(tokenAddress: string, blockchain: EvmBlockchainName): boolean {
  const tokens = NEED_RESET_APPROVE_TOKENS[blockchain] || [];

  return tokens.some(token => compareAddresses(token, tokenAddress));
}
