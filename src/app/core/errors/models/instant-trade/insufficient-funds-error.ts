import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class InsufficientFundsError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(tokenSymbol: string) {
    super('errors.notEnoughBalance', { tokenSymbol });
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}

export default InsufficientFundsError;
