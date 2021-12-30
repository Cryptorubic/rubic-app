import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class InsufficientLiquidityRubicOptimisation extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    const errorKey = 'errors.rubicOptimisation';
    super(errorKey);
    Object.setPrototypeOf(this, InsufficientLiquidityRubicOptimisation.prototype);
  }
}

export default InsufficientLiquidityRubicOptimisation;
