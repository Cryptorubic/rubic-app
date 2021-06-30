import { RubicError } from 'src/app/core/errors/models/RubicError';

export class NotSupportedBridge extends RubicError {
  public comment: string;

  constructor() {
    super('text', 'errors.notSupportedItNetwork');
    Object.setPrototypeOf(this, NotSupportedBridge.prototype);
  }
}
