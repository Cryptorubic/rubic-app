import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { WrongWalletSelectedErrorComponent } from '../../components/wrong-wallet-selected-error/wrong-wallet-selected-error.component';

export class WrongWalletSelectedError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(walletAddress: string) {
    super(WrongWalletSelectedErrorComponent, { walletAddress });
    Object.setPrototypeOf(this, WrongWalletSelectedError.prototype);
  }
}
