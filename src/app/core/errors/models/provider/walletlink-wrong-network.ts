import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class WalletlinkWrongNetwork extends RubicError<ERROR_TYPE.TEXT> {
  public comment: string;

  constructor(networkToChoose: string) {
    super('errors.walletlinkWrongNetwork', { networkToChoose });
    Object.setPrototypeOf(this, WalletlinkWrongNetwork.prototype);
  }
}
