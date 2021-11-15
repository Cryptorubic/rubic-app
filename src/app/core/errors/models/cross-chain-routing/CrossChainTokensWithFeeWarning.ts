import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicWarning } from 'src/app/core/errors/models/RubicWarning';

class CrossChainTokensWithFeeWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.crossChainTokensWithFee');
    Object.setPrototypeOf(this, CrossChainTokensWithFeeWarning.prototype);
  }
}

export default CrossChainTokensWithFeeWarning;
