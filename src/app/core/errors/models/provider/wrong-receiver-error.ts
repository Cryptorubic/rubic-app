import { WrongReceiverErrorComponent } from '../../components/wrong-receiver-error/wrong-receiver-error.component';
import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

export class WrongReceiverError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(WrongReceiverErrorComponent);
    Object.setPrototypeOf(this, WrongReceiverError.prototype);
  }
}
