import { RubicError } from '@core/errors/models/rubic-error';
import { TokenWithFeeErrorComponent } from '@core/errors/components/token-with-fee-error/token-with-fee-error.component';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class TokenWithFeeError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(TokenWithFeeErrorComponent);
    Object.setPrototypeOf(this, TokenWithFeeError.prototype);
  }
}
