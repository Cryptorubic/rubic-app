import { RubicError } from '../RubicError';

export class NotSupportedItNetwork extends RubicError {
  public comment: string;

  constructor() {
    super();
    this.translateKey = 'errors.notSupportedItNetwork';
    this.comment = 'Chosen network is not supported for instant trades';
    Object.setPrototypeOf(this, NotSupportedItNetwork.prototype);
  }
}
