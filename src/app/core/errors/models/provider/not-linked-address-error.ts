import { NoLinkedAccountErrorComponent } from '../../components/no-linked-account-error/no-linked-account-error.component';
import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class NotLinkedAddressError extends RubicError<ERROR_TYPE.COMPONENT> {
  public isWarning = true;

  constructor() {
    super(NoLinkedAccountErrorComponent);
    Object.setPrototypeOf(this, NotLinkedAddressError.prototype);
  }
}
