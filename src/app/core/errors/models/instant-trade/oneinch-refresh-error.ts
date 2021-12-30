import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class OneinchRefreshError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.oneinchRefreshError');
    Object.setPrototypeOf(this, OneinchRefreshError.prototype);
  }
}
