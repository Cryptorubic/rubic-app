import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

class UnsupportedReceiverAddressError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super(`Selected provider doesn't support receiver address.`);
    Object.setPrototypeOf(this, UnsupportedReceiverAddressError.prototype);
  }
}

export default UnsupportedReceiverAddressError;
