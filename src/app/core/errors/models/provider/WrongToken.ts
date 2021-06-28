import { RubicError } from 'src/app/core/errors/models/RubicError';

export class WrongToken extends RubicError {
  public comment: string;

  constructor() {
    super('text', 'errors.wrongToken');
    Object.setPrototypeOf(this, WrongToken.prototype);
  }
}
