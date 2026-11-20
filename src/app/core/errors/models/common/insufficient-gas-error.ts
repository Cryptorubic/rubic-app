import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class InsufficientGasError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.genericInsufficientGasFundsError');
    Object.setPrototypeOf(this, InsufficientGasError.prototype);
  }
}
