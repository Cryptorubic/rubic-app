import { RubicError } from 'src/app/core/errors/models/RubicError';

export class AccountError extends RubicError {
  constructor() {
    super('text', 'errors.noMetamaskAccess');
    Object.setPrototypeOf(this, AccountError.prototype);
  }
}
