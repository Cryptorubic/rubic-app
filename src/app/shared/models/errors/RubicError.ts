export class RubicError extends Error {
  public comment: string;

  public translateKey: string;

  constructor(message?: string) {
    super(message);
    this.translateKey = 'errors.undefined';
    this.comment =
      'Please try again later or try' +
      ' using another device. If you’re still having problems, please reach out to our <a href="mailto:support@rubic.finance" target="_blank">Customer Support</a>.';
    Object.setPrototypeOf(this, RubicError.prototype);
  }
}
