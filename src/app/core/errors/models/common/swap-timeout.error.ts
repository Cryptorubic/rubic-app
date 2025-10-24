import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class SwapTimeoutError extends RubicError<ERROR_TYPE.TEXT> {
  public override readonly showAlert: boolean = false;

  constructor() {
    super('Swap timeout.');
    Object.setPrototypeOf(this, SwapTimeoutError.prototype);
  }
}
