import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class LowGasError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.lowGas');
    Object.setPrototypeOf(this, LowGasError.prototype);
  }
}
