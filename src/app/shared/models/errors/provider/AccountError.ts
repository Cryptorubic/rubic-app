import { RubicError } from '../RubicError';

export class AccountError extends RubicError {
  public comment: string;

  constructor() {
    super();
    this.translateKey = 'errors.noMetamaskAccess';
    this.comment =
      'You have not given us access to your MetaMask’s account. In order to trade, your signature is being requested. Please click on Sign if you wish to proceed.';
  }
}
