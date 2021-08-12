import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class NotSupportedItNetwork extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.notSupportedItNetwork');
    Object.setPrototypeOf(this, NotSupportedItNetwork.prototype);
  }
}
