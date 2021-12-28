import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class CrossChainTokensWithFeeWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.tokensWithFee');
    Object.setPrototypeOf(this, CrossChainTokensWithFeeWarning.prototype);
  }
}

export default CrossChainTokensWithFeeWarning;
