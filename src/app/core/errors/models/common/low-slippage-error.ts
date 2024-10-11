import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

export class LowSlippageError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super(`Please, increase the slippage and try again!`);
    Object.setPrototypeOf(this, LowSlippageError.prototype);
  }
}
