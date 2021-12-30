import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class SignRejectError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.signReject');
    Object.setPrototypeOf(this, SignRejectError.prototype);
  }
}
