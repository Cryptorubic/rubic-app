import { RubicError } from 'src/app/core/errors/models/RubicError';

export class SignRejectError extends RubicError {
  constructor() {
    super('text', 'errors.signReject');
    Object.setPrototypeOf(this, SignRejectError.prototype);
  }
}
