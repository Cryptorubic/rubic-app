import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class NotWhitelistedProviderWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super(
      'Unfortunately, this swap using the calculated provider is currently unavailable. Rubic will recalculate the route for your swap.'
    );
    Object.setPrototypeOf(this, NotWhitelistedProviderWarning.prototype);
  }
}

export default NotWhitelistedProviderWarning;
