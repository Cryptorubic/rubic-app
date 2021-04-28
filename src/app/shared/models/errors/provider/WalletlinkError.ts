import { RubicError } from '../RubicError';

export class WalletlinkError extends RubicError {
  constructor() {
    super();
    Object.setPrototypeOf(this, WalletlinkError.prototype); // to make `instanceof WalletlinkError` work
  }

  public comment: string = `Please make sure that you have scan qrCode`;
}
