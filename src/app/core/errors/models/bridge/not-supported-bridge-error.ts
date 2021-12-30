import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class NotSupportedBridgeError extends RubicError<ERROR_TYPE.TEXT> {
  public comment: string;

  constructor() {
    super('errors.notSupportedBridge');
    Object.setPrototypeOf(this, NotSupportedBridgeError.prototype);
  }
}
