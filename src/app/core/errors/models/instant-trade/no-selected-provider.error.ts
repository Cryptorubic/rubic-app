import { RubicError } from 'src/app/core/errors/models/RubicError';

class NoSelectedProviderError extends RubicError {
  constructor() {
    super('text', 'errors.noSelectedProvider');
    Object.setPrototypeOf(this, NoSelectedProviderError.prototype);
  }
}

export default NoSelectedProviderError;
