import { RubicError } from '../RubicError';

export class SameTokensError extends RubicError {
  constructor(message?: string) {
    super(message);

    this.comment = `You can't choose the same token on both sides, please choose different tokens.`;
  }
}
