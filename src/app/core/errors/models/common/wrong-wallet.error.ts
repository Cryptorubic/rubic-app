import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class WrongWalletError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.wrongPromoterWallet');
    Object.setPrototypeOf(this, WrongWalletError.prototype);
  }
}
