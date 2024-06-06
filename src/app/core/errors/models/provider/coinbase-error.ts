import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { CoinbaseErrorComponent } from '@core/errors/components/coinbase-error/coinbase-error.component';

export class CoinBaseError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(CoinbaseErrorComponent);
    Object.setPrototypeOf(this, CoinBaseError.prototype);
  }
}
