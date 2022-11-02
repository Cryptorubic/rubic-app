import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class CrossChainSwapUnavailableWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.crossChainSwapUnavailable');
    Object.setPrototypeOf(this, CrossChainSwapUnavailableWarning.prototype);
  }
}

export default CrossChainSwapUnavailableWarning;
