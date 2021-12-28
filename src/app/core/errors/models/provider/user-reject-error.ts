import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class UserRejectError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.userReject');
    Object.setPrototypeOf(this, UserRejectError.prototype);
  }
}
