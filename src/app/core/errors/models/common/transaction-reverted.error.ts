import { RubicError } from 'src/app/core/errors/models/RubicError';

class TransactionRevertedError extends RubicError {
  constructor() {
    super('text', 'errors.transactionReverted');
    Object.setPrototypeOf(this, TransactionRevertedError.prototype);
  }
}

export default TransactionRevertedError;
