import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { TokenPocketErrorComponent } from '@core/errors/components/token-pocket-error/token-pocket-error.component';

export class TokenPocketError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(TokenPocketErrorComponent);
    Object.setPrototypeOf(this, TokenPocketError.prototype);
  }
}
