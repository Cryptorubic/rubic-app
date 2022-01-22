import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class WalletNotInstalledError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.walletNotInstalled');
    Object.setPrototypeOf(this, WalletNotInstalledError.prototype);
  }
}
