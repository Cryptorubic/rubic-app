import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class NoDataMyTradesError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.noMetamaskAccess');
    Object.setPrototypeOf(this, NoDataMyTradesError.prototype);
  }
}
