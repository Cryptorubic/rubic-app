import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class UserRejectError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.userReject');
    Object.setPrototypeOf(this, UserRejectError.prototype);
  }
}
