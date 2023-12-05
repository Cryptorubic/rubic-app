import { RubicWarning } from '@core/errors/models/rubic-warning';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class DelayedApproveError extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super(
      'Your transaction is still in progress. Please wait for it to complete before performing a new Approve transaction. If it takes too long, try to boost your transaction in wallet'
    );
    Object.setPrototypeOf(this, DelayedApproveError.prototype);
  }
}

export default DelayedApproveError;
