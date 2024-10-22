import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class OneinchUnavailableError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Oneinch provider is unavailable. Try to choose another or wait a few minutes.');
    Object.setPrototypeOf(this, OneinchUnavailableError.prototype);
  }
}
