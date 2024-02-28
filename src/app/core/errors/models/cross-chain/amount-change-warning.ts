import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class AmountChangeWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(public readonly oldAmount: string, public readonly newAmount: string) {
    super(
      'The rate has changed. You should accept the new rate in order to continue the transaction.'
    );
    Object.setPrototypeOf(this, AmountChangeWarning.prototype);
  }
}

export default AmountChangeWarning;
