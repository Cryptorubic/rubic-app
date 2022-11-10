import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class ExecutionRevertedError extends RubicError<ERROR_TYPE.RAW_MESSAGE> {
  constructor(message?: string) {
    super(null, {}, message);
    Object.setPrototypeOf(this, ExecutionRevertedError.prototype);
  }
}
