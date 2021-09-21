import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class OneinchNotSupportedTokens extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.1inchNotSupportedToken');
    Object.setPrototypeOf(this, OneinchNotSupportedTokens.prototype);
  }
}
