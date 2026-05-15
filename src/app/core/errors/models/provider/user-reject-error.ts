import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class UserRejectError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(message?: string) {
    super('errors.userReject', null, message);
    Object.setPrototypeOf(this, UserRejectError.prototype);
  }
}
