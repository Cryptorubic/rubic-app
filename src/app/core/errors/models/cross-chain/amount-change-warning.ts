import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';
import { UpdatedRatesError } from 'rubic-sdk';

class AmountChangeWarning extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(public readonly transaction: UpdatedRatesError['transaction']) {
    super(
      'The rate has changed. You should accept the new rate in order to continue the transaction.'
    );
    Object.setPrototypeOf(this, AmountChangeWarning.prototype);
  }
}

export default AmountChangeWarning;
