import { RubicError } from '../RubicError';

export class WalletError extends RubicError {
  public comment: string = 'You have not connect any wallet';
}
