import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class SignRejectError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.signReject');
    Object.setPrototypeOf(this, SignRejectError.prototype);
  }
}
