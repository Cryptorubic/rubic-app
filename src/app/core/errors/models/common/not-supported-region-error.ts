import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

class NotSupportedRegionRubicError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Birders does not provide services for your current country/region.');
    Object.setPrototypeOf(this, NotSupportedRegionRubicError.prototype);
  }
}

export default NotSupportedRegionRubicError;
