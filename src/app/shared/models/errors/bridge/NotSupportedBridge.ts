import { RubicError } from '../RubicError';

export class NotSupportedBridge extends RubicError {
  public comment: string;

  constructor() {
    super();
    this.translateKey = 'errors.notSupportedItNetwork';
    this.comment =
      'Chosen bridge is not supported. Please, change the order or choose another networks.';
    Object.setPrototypeOf(this, NotSupportedBridge.prototype);
  }
}
