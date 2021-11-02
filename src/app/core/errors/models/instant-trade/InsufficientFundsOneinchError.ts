import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { InsufficientFundsOneinchErrorComponent } from '@core/errors/components/insufficient-funds-oneinch-error/insufficient-funds-oneinch-error.component';

class InsufficientFundsOneinchError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(nativeToken: string) {
    super(InsufficientFundsOneinchErrorComponent, {
      nativeToken
    });
    Object.setPrototypeOf(this, InsufficientFundsOneinchError.prototype);
  }
}

export default InsufficientFundsOneinchError;
