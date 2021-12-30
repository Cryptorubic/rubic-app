import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class CrossChainIsUnavailableWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.crossChainIsUnavailable');
    Object.setPrototypeOf(this, CrossChainIsUnavailableWarning.prototype);
  }
}

export default CrossChainIsUnavailableWarning;
