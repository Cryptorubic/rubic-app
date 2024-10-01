import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class InsufficientGasError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super(
      `Insufficient funds for gas fee. Decrease swap amount or increase native tokens balance.`
    );
    Object.setPrototypeOf(this, InsufficientGasError.prototype);
  }
}
