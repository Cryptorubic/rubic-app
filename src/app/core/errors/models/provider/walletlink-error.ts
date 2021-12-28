import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class WalletlinkError extends RubicError<ERROR_TYPE.TEXT> {
  public comment: string;

  constructor() {
    super('errors.noQrCode');
    Object.setPrototypeOf(this, WalletlinkError.prototype);
  }
}
