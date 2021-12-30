import { RubicError } from '@core/errors/models/rubic-error';
import { InsufficientFundsOneinchErrorComponent } from '@core/errors/components/insufficient-funds-oneinch-error/insufficient-funds-oneinch-error.component';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class InsufficientFundsOneinchError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(nativeToken: string) {
    super(InsufficientFundsOneinchErrorComponent, {
      nativeToken
    });
    Object.setPrototypeOf(this, InsufficientFundsOneinchError.prototype);
  }
}

export default InsufficientFundsOneinchError;
