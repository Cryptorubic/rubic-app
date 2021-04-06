import { RubicError } from '../RubicError';

export class MetamaskError extends RubicError {
  constructor() {
    super();
    Object.setPrototypeOf(this, MetamaskError.prototype); // to make `instanceof MetamaskError` work
  }

  public comment: string = `Please make sure that you have metamask plugin installed and unlocked.\nYou can download it on metamask.io.`;
}
