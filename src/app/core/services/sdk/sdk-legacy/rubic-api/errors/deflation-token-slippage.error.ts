import { RubicSdkError } from '@cryptorubic/web3';

/**
 * Thrown, when `swap` simulation failed and in pair some of tokens is with deflation.
 */
export class DeflationTokenLowSlippageError extends RubicSdkError {
  constructor(public readonly tokenAddress: string) {
    super(
      `Token ${tokenAddress} with deflation, it has its own fee, try to increase slippage to swap.`
    );
    Object.setPrototypeOf(this, DeflationTokenLowSlippageError.prototype);
  }
}
