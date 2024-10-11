import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

export class MaxFeePerGasError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Max fee per gas less than block base fee. Increase max gas in your wallet.');
    Object.setPrototypeOf(this, MaxFeePerGasError.prototype);
  }
}
