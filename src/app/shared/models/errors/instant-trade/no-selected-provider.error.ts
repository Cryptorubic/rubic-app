import { RubicError } from '../RubicError';

class NoSelectedProviderError extends RubicError {
  constructor(message?: string) {
    super(message);
    this.translateKey = 'errors.noSelectedProvider';
    this.comment = `You have not selected any swap provider.`;
    Object.setPrototypeOf(this, NoSelectedProviderError.prototype);
  }
}

export default NoSelectedProviderError;
