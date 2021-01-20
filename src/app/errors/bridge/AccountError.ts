import {RubicError} from '../RubicError';

export class AccountError extends RubicError {
    public comment: string = 'To carry out the operation, you must provide the Metamask extension with access to your account.';
}
