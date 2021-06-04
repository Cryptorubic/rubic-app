import { RubicError } from '../RubicError';

export class NotSupportedNetworkError extends RubicError {
  public comment: string;

  constructor(public readonly networkToChoose: string) {
    super();
    this.translateKey = 'errors.notSupportedNetwork';
    this.comment = `Selected provider is not supported by current blockchain. Please choose another provider or ${networkToChoose} network.`;
    Object.setPrototypeOf(this, NotSupportedNetworkError.prototype);
  }
}
