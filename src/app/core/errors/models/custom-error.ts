import { RubicError } from 'src/app/core/errors/models/RubicError';

class CustomError extends RubicError {
  constructor(message: string) {
    super('text', null, message.charAt(0).toUpperCase() + message.slice(1));
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
