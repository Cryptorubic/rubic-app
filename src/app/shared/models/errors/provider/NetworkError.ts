import { RubicError } from '../RubicError';

export class NetworkError extends RubicError {
  constructor(public readonly networkToChoose: string, message?: string) {
    super(message);
    this.translateKey = 'errors.wrongNetwork';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
