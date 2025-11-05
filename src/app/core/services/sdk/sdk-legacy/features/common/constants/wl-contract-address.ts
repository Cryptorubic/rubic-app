import { EVM_BLOCKCHAIN_NAME, EvmBlockchainName } from '@cryptorubic/core';

export const wlContractAddress: Record<EvmBlockchainName, string> = Object.values(
  EVM_BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
  return {
    ...acc,
    [blockchain]: ''
  };
}, {} as Record<EvmBlockchainName, string>);
