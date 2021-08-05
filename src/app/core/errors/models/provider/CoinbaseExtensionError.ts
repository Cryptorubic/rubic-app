import { RubicError } from 'src/app/core/errors/models/RubicError';

export class CoinbaseExtensionError extends RubicError {
  constructor() {
    super('text', 'errors.removeCoinbaseExtension');
    Object.setPrototypeOf(this, CoinbaseExtensionError.prototype);
  }
}
