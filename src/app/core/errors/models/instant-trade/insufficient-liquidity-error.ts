import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class InsufficientLiquidityError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(type: 'InstantTrade' | 'CrossChainRouting' = 'InstantTrade') {
    const errorKey =
      type === 'InstantTrade'
        ? 'errors.insufficientLiquidityIT'
        : 'errors.insufficientLiquidityCCR';
    super(errorKey);
    Object.setPrototypeOf(this, InsufficientLiquidityError.prototype);
  }
}

export default InsufficientLiquidityError;
