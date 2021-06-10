import { RubicError } from '../RubicError';

export class OverQueryLimitError extends RubicError {
  constructor() {
    super();
    this.comment =
      'You have attempted to execute too many trades in a short period of time and exceeded Binance bridge restrictions of 3 trades-old maximum in 30 minutes. Please wait and try again later, if you still have problems please reach out to our <a href="mailto:support@rubic.finance" target="_blank">Customer Support</a>.';
  }
}
