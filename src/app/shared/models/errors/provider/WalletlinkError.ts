import { RubicError } from '../RubicError';

export class WalletlinkError extends RubicError {
  public comment: string;

  constructor() {
    super();
    this.comment = `Please make sure that you have scan qrCode`;
    Object.setPrototypeOf(this, WalletlinkError.prototype);
  }
}
