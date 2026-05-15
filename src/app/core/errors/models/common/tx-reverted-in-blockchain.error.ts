import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class TxRevertedInBlockchainError extends RubicError<ERROR_TYPE.TEXT> {
  public override readonly showAlert: boolean = false;

  constructor() {
    super('Transaction reverted during execution in blockchain.');
    Object.setPrototypeOf(this, TxRevertedInBlockchainError.prototype);
  }
}
