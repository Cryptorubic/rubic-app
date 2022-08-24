import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class NotWhitelistedProviderError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Provider is not yet whitelisted. Trade is recalculated.');
    Object.setPrototypeOf(this, NotWhitelistedProviderError.prototype);
  }
}

export default NotWhitelistedProviderError;
