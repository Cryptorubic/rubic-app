import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class NeedDisableCtrlWalletError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(walletName: string) {
    super('errors.needDisableCtrlWallet', { walletName });
    Object.setPrototypeOf(this, NeedDisableCtrlWalletError.prototype);
  }
}
