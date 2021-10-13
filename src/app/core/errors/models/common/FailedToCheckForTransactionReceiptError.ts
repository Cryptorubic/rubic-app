import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class FailedToCheckForTransactionReceiptError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Failed to check for transaction receipt.');
    Object.setPrototypeOf(this, FailedToCheckForTransactionReceiptError.prototype);
  }
}

export default FailedToCheckForTransactionReceiptError;
