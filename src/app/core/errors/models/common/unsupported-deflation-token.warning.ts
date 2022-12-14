import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class UnsupportedDeflationTokenWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super(null);
    Object.setPrototypeOf(this, UnsupportedDeflationTokenWarning.prototype);
  }
}

export default UnsupportedDeflationTokenWarning;
