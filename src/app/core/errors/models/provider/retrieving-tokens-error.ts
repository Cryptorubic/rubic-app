import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class RetrievingTokensError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.RetrievingTokensError');
    Object.setPrototypeOf(this, RetrievingTokensError.prototype);
  }
}
