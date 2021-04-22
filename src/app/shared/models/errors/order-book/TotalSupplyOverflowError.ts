import { RubicError } from '../RubicError';

export class TotalSupplyOverflowError extends RubicError {
  constructor(private _tokenSymbol: string, private _totalSupply: string, message?: string) {
    super(message);
    Object.setPrototypeOf(this, TotalSupplyOverflowError.prototype); // to make `instanceof NetworkError` work
  }

  get tokenSymbol(): string {
    return this._tokenSymbol;
  }

  get totalSupply(): string {
    return this._totalSupply;
  }
}
