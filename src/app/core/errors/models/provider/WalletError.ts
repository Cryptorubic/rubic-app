import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class WalletError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.noWallet');
    Object.setPrototypeOf(this, WalletError.prototype);
  }
}
