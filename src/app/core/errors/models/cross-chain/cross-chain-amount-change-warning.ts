import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class CrossChainAmountChangeWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super('The rate has been changed, trade will be recalculated');
    Object.setPrototypeOf(this, CrossChainAmountChangeWarning.prototype);
  }
}

export default CrossChainAmountChangeWarning;
