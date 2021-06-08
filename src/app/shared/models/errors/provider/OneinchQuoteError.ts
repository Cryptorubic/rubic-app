import { RubicError } from '../RubicError';

export class OneinchQuoteError extends RubicError {
  constructor() {
    super();
    this.translateKey = 'errors.oneInchQuote';
    this.comment = 'Oneinch quote error';
  }
}
