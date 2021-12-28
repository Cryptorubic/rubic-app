import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class NoSelectedProviderError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.noSelectedProvider');
    Object.setPrototypeOf(this, NoSelectedProviderError.prototype);
  }
}

export default NoSelectedProviderError;
