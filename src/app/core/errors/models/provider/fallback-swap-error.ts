import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class FallbackSwapError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.fallbackSwap');
    Object.setPrototypeOf(this, FallbackSwapError.prototype);
  }
}
