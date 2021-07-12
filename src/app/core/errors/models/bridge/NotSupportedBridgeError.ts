import { RubicError } from 'src/app/core/errors/models/RubicError';

export class NotSupportedBridgeError extends RubicError {
  public comment: string;

  constructor() {
    super('text', 'errors.notSupportedBridge');
    Object.setPrototypeOf(this, NotSupportedBridgeError.prototype);
  }
}
