import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class OnlyDepositSwapsAllowedError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Clearswap supports deposit cross-chain swaps only.');
    Object.setPrototypeOf(this, OnlyDepositSwapsAllowedError.prototype);
  }
}
