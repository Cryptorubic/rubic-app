import { RubicError } from '../RubicError';

export class MetamaskError extends RubicError {
  public comment: string =
    'This error occurs because you didn’t install Metamask add-on to your browser. To solve this problem please install and activate Metamask add-on to your browser.\n' +
    'Please go to www.metamask.io and follow the steps.';
}
