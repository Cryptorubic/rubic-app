import { EvmBlockchainName } from '@cryptorubic/core';

export type HinkalPrivateBalance = Partial<
  Record<EvmBlockchainName, { tokenAddress: string; amount: string }[]>
>;
