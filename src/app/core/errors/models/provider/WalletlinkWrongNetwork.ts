import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class WalletlinkWrongNetwork extends RubicError<ERROR_TYPE.TEXT> {
  public comment: string;

  constructor(networkToChoose) {
    super('errors.walletlinkWrongNetwork', { networkToChoose });
    Object.setPrototypeOf(this, WalletlinkWrongNetwork.prototype);
  }
}
