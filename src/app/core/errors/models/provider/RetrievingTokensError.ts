import { RubicError } from 'src/app/core/errors/models/RubicError';

export class RetrievingTokensError extends RubicError {
  constructor() {
    super('text', 'errors.RetrievingTokensError');
    Object.setPrototypeOf(this, RetrievingTokensError.prototype);
  }
}
