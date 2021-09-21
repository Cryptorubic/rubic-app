import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class InsufficientLiquidityError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(type: 'InstantTrade' | 'CrossChainRouting' = 'InstantTrade') {
    if (type === 'InstantTrade') {
      super('errors.insufficientLiquidityIT');
    } else {
      super('errors.insufficientLiquidityCCR');
    }
    Object.setPrototypeOf(this, InsufficientLiquidityError.prototype);
  }
}

export default InsufficientLiquidityError;
