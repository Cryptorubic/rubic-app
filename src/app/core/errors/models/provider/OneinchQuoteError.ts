import { RubicError } from 'src/app/core/errors/models/RubicError';

export class OneinchQuoteError extends RubicError {
  constructor() {
    super('text', 'errors.oneInchQuote');
    Object.setPrototypeOf(this, OneinchQuoteError.prototype);
  }
}
