import { RubicError } from '../RubicError';

class InsufficientFundsError extends RubicError {
  constructor(
    public readonly tokenSymbol: string,
    public readonly balance: string,
    public readonly requiredBalance: string,
    message?: string
  ) {
    super(message);
    this.translateKey = 'errors.insufficientFunds';
    this.comment = `You have not enough ${tokenSymbol}. Your balance is ${balance} ${tokenSymbol}, but ${requiredBalance} ${tokenSymbol} is required.`;
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}

export default InsufficientFundsError;
