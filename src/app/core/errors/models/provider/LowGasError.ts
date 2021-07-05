import { RubicError } from 'src/app/core/errors/models/RubicError';

export class LowGasError extends RubicError {
  constructor() {
    super('text', 'errors.lowGas');
    Object.setPrototypeOf(this, LowGasError.prototype);
  }
}
