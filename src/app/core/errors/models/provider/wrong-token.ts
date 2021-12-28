import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class WrongToken extends RubicError<ERROR_TYPE.TEXT> {
  public comment: string;

  constructor() {
    super('errors.wrongToken');
    Object.setPrototypeOf(this, WrongToken.prototype);
  }
}
