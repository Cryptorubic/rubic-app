import { RubicError } from '../RubicError';

class InsufficientFundsError extends RubicError {
  constructor(tokenSymbol: string, balance: string, requiredBalance: string, message?: string) {
    super(message);
    this.comment = `You have not enough ${tokenSymbol}. Your balance is ${balance} ${tokenSymbol}, but ${requiredBalance} ${tokenSymbol} is required.`;
  }
}

export default InsufficientFundsError;
