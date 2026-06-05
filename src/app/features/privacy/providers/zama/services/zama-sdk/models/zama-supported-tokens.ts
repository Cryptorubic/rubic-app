import { EvmBlockchainName } from '@cryptorubic/core';

export type ZamaSupportedToken = {
  tokenAddress: string;
  shieldedTokenAddress: string;
  shieldedTokenDeployBlock: bigint;
};

export type ZamaSupportedTokens = Partial<Record<EvmBlockchainName, ZamaSupportedToken[]>>;
