import { InsufficientFundsErrorComponent } from 'src/app/core/errors/components/insufficient-funds-error/insufficient-funds-error.component';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class InsufficientFundsError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(tokenSymbol: string) {
    super(InsufficientFundsErrorComponent, {
      tokenSymbol
    });
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}

export default InsufficientFundsError;
