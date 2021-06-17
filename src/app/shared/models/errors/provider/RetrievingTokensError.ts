import { RubicError } from '../RubicError';

export class RetrievingTokensError extends RubicError {
  constructor(public readonly networkToChoose: string, message?: string) {
    super(message);
    this.translateKey = 'errors.RetrievingTokensError';
    this.message = 'Error retrieving tokens`';
    Object.setPrototypeOf(this, RetrievingTokensError.prototype);
  }
}
