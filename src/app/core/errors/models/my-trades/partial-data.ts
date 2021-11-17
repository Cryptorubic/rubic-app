import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class PartialDataError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('errors.partialTradesData');
    Object.setPrototypeOf(this, PartialDataError.prototype);
  }
}
