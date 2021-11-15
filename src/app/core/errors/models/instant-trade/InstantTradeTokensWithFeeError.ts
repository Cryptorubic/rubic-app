import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicError } from '@core/errors/models/RubicError';

class InstantTradeTokensWithFeeError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.tokensWithFee');
    Object.setPrototypeOf(this, InstantTradeTokensWithFeeError.prototype);
  }
}

export default InstantTradeTokensWithFeeError;
