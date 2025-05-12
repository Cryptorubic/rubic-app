import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class NeedDisableTokenPocketWalletError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(walletName: string) {
    super('errors.needDisableTokenPocketWallet', { walletName });
    Object.setPrototypeOf(this, NeedDisableTokenPocketWalletError.prototype);
  }
}
