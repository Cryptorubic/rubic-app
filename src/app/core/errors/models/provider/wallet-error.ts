import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class WalletError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.noWallet');
    Object.setPrototypeOf(this, WalletError.prototype);
  }
}
