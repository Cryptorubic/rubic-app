import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

class InactiveWalletError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Account is not activated');
    Object.setPrototypeOf(this, InactiveWalletError.prototype);
  }
}

export default InactiveWalletError;
