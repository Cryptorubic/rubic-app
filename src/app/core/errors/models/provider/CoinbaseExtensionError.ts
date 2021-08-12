import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class CoinbaseExtensionError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.removeCoinbaseExtension');
    Object.setPrototypeOf(this, CoinbaseExtensionError.prototype);
  }
}
