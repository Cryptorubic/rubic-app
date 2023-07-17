import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class TooLowAmountError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super(
      "The swap can't be executed with the entered amount of tokens. Please change it to the greater amount."
    );
    Object.setPrototypeOf(this, TooLowAmountError.prototype);
  }
}

export default TooLowAmountError;
