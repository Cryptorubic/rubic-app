import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicWarning } from 'src/app/core/errors/models/RubicWarning';

class CrossChainIsUnavailableWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.crossChainIsUnavailable');
    Object.setPrototypeOf(this, CrossChainIsUnavailableWarning.prototype);
  }
}

export default CrossChainIsUnavailableWarning;
