import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class NotWhitelistedProviderWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(public providerRouter?: string) {
    super(null);
    Object.setPrototypeOf(this, NotWhitelistedProviderWarning.prototype);
  }
}

export default NotWhitelistedProviderWarning;
