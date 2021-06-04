import { RubicError } from '../RubicError';

export class WrongToken extends RubicError {
  public comment: string;

  constructor() {
    super();
    this.translateKey = 'errors.wrongToken';
    this.comment = `Rubic bridge supports only rubic token.`;
    Object.setPrototypeOf(this, WrongToken.prototype);
  }
}
