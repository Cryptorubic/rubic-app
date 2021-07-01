import { RubicError } from 'src/app/core/errors/models/RubicError';

export class NotSupportedItNetwork extends RubicError {
  constructor() {
    super('text', 'errors.notSupportedItNetwork');
    Object.setPrototypeOf(this, NotSupportedItNetwork.prototype);
  }
}
