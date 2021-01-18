import {RubicError} from '../RubicError';

export class UserRejectError extends RubicError {
    public comment: string = 'The transaction was declined by the user.';
}
