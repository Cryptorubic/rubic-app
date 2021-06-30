import { RubicError } from 'src/app/core/errors/models/RubicError';

export class UserRejectError extends RubicError {
  constructor() {
    super('text', 'errors.userReject');
    Object.setPrototypeOf(this, UserRejectError.prototype);
  }
}
