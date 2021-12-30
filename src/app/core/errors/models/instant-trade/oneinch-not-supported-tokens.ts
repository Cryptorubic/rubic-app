import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class OneinchNotSupportedTokens extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.1inchNotSupportedToken');
    Object.setPrototypeOf(this, OneinchNotSupportedTokens.prototype);
  }
}
