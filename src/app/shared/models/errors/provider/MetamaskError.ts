import { RubicError } from '../RubicError';

export class MetamaskError extends RubicError {
  constructor() {
    super();
    Object.setPrototypeOf(this, MetamaskError.prototype); // to make `instanceof MetamaskError` work
  }

  public comment: string = `Please check that you have active Metamask plugin in your browser and Metamask wallet is connected.\nIf not please download it from www.metamask.io and connect wallet using Connect Wallet button.`;
}
