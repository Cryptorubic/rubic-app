import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class UserRejectNetworkSwitchError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.rejectedNetworkSwitch');
    Object.setPrototypeOf(this, UserRejectNetworkSwitchError.prototype);
  }
}
