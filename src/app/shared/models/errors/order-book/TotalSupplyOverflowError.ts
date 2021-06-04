import { RubicError } from '../RubicError';

export class TotalSupplyOverflowError extends RubicError {
  constructor(
    public readonly tokenSymbol: string,
    public readonly totalSupply: string,
    message?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, TotalSupplyOverflowError.prototype); // to make `instanceof NetworkError` work
  }
}
