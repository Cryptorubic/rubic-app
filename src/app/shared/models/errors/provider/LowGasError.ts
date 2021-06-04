import { RubicError } from '../RubicError';

export class LowGasError extends RubicError {
  constructor() {
    super();
    this.translateKey = 'errors.lowGas';
    this.comment =
      'Transaction gas is too low. There is not enough gas to cover minimal cost of the transaction. Try increasing supplied gas';
  }
}
