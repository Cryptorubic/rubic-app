import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class LowSlippageError extends RubicError<ERROR_TYPE.TEXT> {
  /**
   * @param minSlippage number from 0 to 1
   */
  constructor(minSlippage?: number) {
    super(
      `Slippage is too low for transaction.${
        minSlippage ? ` Minimal slippage percent is ${minSlippage * 100}.` : ''
      } `
    );
    Object.setPrototypeOf(this, LowSlippageError.prototype);
  }
}
