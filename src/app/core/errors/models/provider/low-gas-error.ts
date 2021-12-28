import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class LowGasError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.lowGas');
    Object.setPrototypeOf(this, LowGasError.prototype);
  }
}
