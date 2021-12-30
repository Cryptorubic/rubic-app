import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class FailedToCheckForTransactionReceiptError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Failed to check for transaction receipt.');
    Object.setPrototypeOf(this, FailedToCheckForTransactionReceiptError.prototype);
  }
}

export default FailedToCheckForTransactionReceiptError;
