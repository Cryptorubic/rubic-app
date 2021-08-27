import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class CrossChainIsUnavailableError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.crossChainIsUnavailable');
    Object.setPrototypeOf(this, CrossChainIsUnavailableError.prototype);
  }
}

export default CrossChainIsUnavailableError;
