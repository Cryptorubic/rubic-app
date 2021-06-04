import { RubicError } from '../RubicError';

export class MetamaskError extends RubicError {
  constructor() {
    super();
    Object.setPrototypeOf(this, MetamaskError.prototype);
    this.translateKey = 'errors.noMetamaskInstalled';
    this.comment =
      'Please make sure that you have metamask plugin installed and unlocked. You can download it on <a href="https://www.metamask.io" target="_blank">metamask.io</a>.';
  }
}
