import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class TransactionRevertedError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.cancelDeadline');
    Object.setPrototypeOf(this, TransactionRevertedError.prototype);
  }
}

export default TransactionRevertedError;
