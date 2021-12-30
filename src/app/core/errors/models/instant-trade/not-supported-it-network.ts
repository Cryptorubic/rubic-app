import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class NotSupportedItNetwork extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.notSupportedItNetwork');
    Object.setPrototypeOf(this, NotSupportedItNetwork.prototype);
  }
}
