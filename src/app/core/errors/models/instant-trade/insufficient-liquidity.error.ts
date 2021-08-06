import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class InsufficientLiquidityError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.insufficientLiquidity');
    Object.setPrototypeOf(this, InsufficientLiquidityError.prototype);
  }
}

export default InsufficientLiquidityError;
