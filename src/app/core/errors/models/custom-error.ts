import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class CustomError extends RubicError<ERROR_TYPE.RAW_MESSAGE> {
  constructor(message: string) {
    super(null, null, message.charAt(0).toUpperCase() + message.slice(1));
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
