import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class UnsupportedDeflationToken extends RubicWarning<ERROR_TYPE.COMPONENT> {
  constructor() {
    super();
    Object.setPrototypeOf(this, UnsupportedDeflationToken.prototype);
  }
}

export default UnsupportedDeflationToken;
