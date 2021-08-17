import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class OneinchQuoteError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.oneInchQuote');
    Object.setPrototypeOf(this, OneinchQuoteError.prototype);
  }
}
