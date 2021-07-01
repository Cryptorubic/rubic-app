import { RubicError } from 'src/app/core/errors/models/RubicError';

export class WalletError extends RubicError {
  constructor() {
    super('text', 'errors.noWallet');
    Object.setPrototypeOf(this, WalletError.prototype);
  }
}
