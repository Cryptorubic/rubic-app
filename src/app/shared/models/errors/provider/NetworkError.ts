import { RubicError } from '../RubicError';

export class NetworkError extends RubicError {
  constructor(private _networkToChoose: string, message?: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkError.prototype); // to make `instanceof NetworkError` work
  }

  get networkToChoose() {
    return this._networkToChoose;
  }
}
