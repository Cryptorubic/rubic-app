import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { TokenWithFeeErrorComponent } from '@core/errors/components/token-with-fee-error/token-with-fee-error.component';

export class TokenWithFeeError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(TokenWithFeeErrorComponent);
    Object.setPrototypeOf(this, TokenWithFeeError.prototype);
  }
}
