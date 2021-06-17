import { RubicError } from '../RubicError';

export class SignRejectError extends RubicError {
  constructor() {
    super();
    this.translateKey = 'errors.signReject';
    this.comment =
      'You have reject wallet sign. Please confirm it first to login at our application';
    Object.setPrototypeOf(this, SignRejectError.prototype);
  }
}
