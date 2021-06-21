import { RubicError } from 'src/app/shared/models/errors/RubicError';

class CustomError extends RubicError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
