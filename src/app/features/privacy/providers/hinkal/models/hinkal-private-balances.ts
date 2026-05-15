import { EvmBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';

export type HinkalPrivateBalance = Partial<
  Record<EvmBlockchainName, { tokenAddress: string; amount: BigNumber }[]>
>;
