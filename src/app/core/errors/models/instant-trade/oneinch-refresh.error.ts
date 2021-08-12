import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class OneinchRefreshError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.oneinchRefreshError');
    Object.setPrototypeOf(this, OneinchRefreshError.prototype);
  }
}
