import { OnChainTradeType } from '@cryptorubic/core';
import { OnChainCalculationOptions } from './on-chain-calculation-options';

export interface OnChainManagerCalculationOptions extends OnChainCalculationOptions {
  readonly timeout?: number;
  readonly disabledProviders?: OnChainTradeType[];
}
