import { RubicError } from '../RubicError';

export class WalletconnectError extends RubicError {
  public comment: string;

  constructor() {
    super();
    this.comment = 'Please make sure that you have scan qrCode';
    Object.setPrototypeOf(this, WalletconnectError.prototype); // to make `instanceof WalletlinkError` work
  }
}
