import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

class TransactionRevertedError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.cancelDeadline');
    Object.setPrototypeOf(this, TransactionRevertedError.prototype);
  }
}

export default TransactionRevertedError;
