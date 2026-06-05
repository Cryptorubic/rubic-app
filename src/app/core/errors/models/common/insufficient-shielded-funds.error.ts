import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class InsufficientShieldedFundsError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super(
      'Insufficient gas balance for this transaction. Leave a small amount of native tokens for gas fees.'
    );
    Object.setPrototypeOf(this, InsufficientShieldedFundsError.prototype);
  }
}
