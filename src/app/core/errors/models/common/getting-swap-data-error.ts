import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class GettingSwapDataError extends RubicError<ERROR_TYPE.RAW_MESSAGE> {
  constructor(message?: string) {
    super(null, {}, message);
    Object.setPrototypeOf(this, GettingSwapDataError.prototype);
  }
}
