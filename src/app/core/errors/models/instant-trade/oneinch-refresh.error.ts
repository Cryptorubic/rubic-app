import { RubicError } from 'src/app/core/errors/models/RubicError';

export class OneinchRefreshError extends RubicError {
  constructor() {
    super('text', 'errors.oneinchRefreshError');
    Object.setPrototypeOf(this, OneinchRefreshError.prototype);
  }
}
