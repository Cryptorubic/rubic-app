import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class InsufficientLiquidityRubicOptimisation extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    const errorKey = 'errors.rubicOptimisation';
    super(errorKey);
    Object.setPrototypeOf(this, InsufficientLiquidityRubicOptimisation.prototype);
  }
}

export default InsufficientLiquidityRubicOptimisation;
