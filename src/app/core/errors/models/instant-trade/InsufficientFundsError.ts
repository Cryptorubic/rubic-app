// tslint:disable-next-line:max-line-length
import { InsufficientFundsErrorComponent } from 'src/app/core/errors/components/insufficient-funds-error/insufficient-funds-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';

class InsufficientFundsError extends RubicError {
  constructor(tokenSymbol: string, balance: string, requiredBalance: string) {
    super('component', null, null, InsufficientFundsErrorComponent, {
      tokenSymbol,
      balance,
      requiredBalance
    });
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}

export default InsufficientFundsError;
