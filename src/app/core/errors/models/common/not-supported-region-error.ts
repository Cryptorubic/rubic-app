import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

class NotSupportedRegionRubicError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super(
      "Selected provider doesn't support your contry. Try to use VPN or select another provider."
    );
    Object.setPrototypeOf(this, NotSupportedRegionRubicError.prototype);
  }
}

export default NotSupportedRegionRubicError;
