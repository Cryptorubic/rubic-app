import { EvmBlockchainName } from '@cryptorubic/core';

export type ZamaSupportedTokens = Partial<
  Record<EvmBlockchainName, { tokenAddress: string; shieldedTokenAddress: string }[]>
>;
