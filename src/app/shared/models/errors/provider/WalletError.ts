import { RubicError } from '../RubicError';

export class WalletError extends RubicError {
  constructor() {
    super();
    this.translateKey = 'errors.noWallet';
    this.comment = 'You have not connect any wallet';
  }
}
