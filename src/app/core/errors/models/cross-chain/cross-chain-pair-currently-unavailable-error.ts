import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

class CrossChainPairCurrentlyUnavailableError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super(
      null,
      {},
      'The swap between this pair of tokens is currently unavailable. Please try again later.'
    );
    Object.setPrototypeOf(this, CrossChainPairCurrentlyUnavailableError.prototype);
  }
}

export default CrossChainPairCurrentlyUnavailableError;
