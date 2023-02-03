import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class UserRejectSigningError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('You rejected the signing.');
    Object.setPrototypeOf(this, UserRejectSigningError.prototype);
  }
}
