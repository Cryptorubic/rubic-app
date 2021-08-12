import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class WalletlinkError extends RubicError<ERROR_TYPE.TEXT> {
  public comment: string;

  constructor() {
    super('errors.noQrCode');
    Object.setPrototypeOf(this, WalletlinkError.prototype);
  }
}
