import {RubicError} from '../RubicError';

export class UserRejectError extends RubicError {
    public comment: string = 'You rejected the execution of the transaction. Please confirm it first in order to complete the trade.';
}
