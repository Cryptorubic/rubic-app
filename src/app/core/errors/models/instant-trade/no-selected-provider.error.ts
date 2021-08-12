import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class NoSelectedProviderError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.noSelectedProvider');
    Object.setPrototypeOf(this, NoSelectedProviderError.prototype);
  }
}

export default NoSelectedProviderError;
