import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class CustomError extends RubicError<ERROR_TYPE.RAW_MESSAGE> {
  constructor(message: string) {
    super(null, null, message.charAt(0).toUpperCase() + message.slice(1));
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
