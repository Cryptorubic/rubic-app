import { RubicError } from 'src/app/core/errors/models/RubicError';

class InsufficientLiquidityError extends RubicError {
  constructor() {
    super('text', 'errors.insufficientLiquidity');
    Object.setPrototypeOf(this, InsufficientLiquidityError.prototype);
  }
}

export default InsufficientLiquidityError;
