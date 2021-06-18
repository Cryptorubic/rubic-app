import { RubicError } from '../RubicError';

export class UserRejectError extends RubicError {
  constructor() {
    super();
    this.translateKey = 'errors.userReject';
    this.comment =
      'You rejected the execution of the transaction. Please confirm it first in order to complete the trade.';
    Object.setPrototypeOf(this, UserRejectError.prototype);
  }
}
