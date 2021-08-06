// tslint:disable-next-line:max-line-length
import { InsufficientFundsErrorComponent } from 'src/app/core/errors/components/insufficient-funds-error/insufficient-funds-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

class InsufficientFundsError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(tokenSymbol: string, balance: string, requiredBalance: string) {
    super(InsufficientFundsErrorComponent, {
      tokenSymbol,
      balance,
      requiredBalance
    });
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}

export default InsufficientFundsError;
